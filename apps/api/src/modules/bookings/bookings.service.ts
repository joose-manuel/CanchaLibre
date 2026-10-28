import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BookingDetails as BookingDetailsModel,
  BookingStatus,
  BookingSummary as BookingSummaryModel,
  MatchPlayerStatus,
  MatchStatus,
  NotificationType,
  PaymentStatus,
  UserRole,
} from '@canchalibre/shared-domain';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { toBookingDetails, toBookingSummary } from '../../common/mappers/api.mapper';
import { NotificationsService } from '../notifications/notifications.service';
import { Payment } from '../payments/entities/payment.entity';
import { MatchPlayer } from '../matches/entities/match-player.entity';
import { Match } from '../matches/entities/match.entity';
import { Booking } from './entities/booking.entity';

const DETAIL_RELATIONS = [
  'match',
  'match.creator',
  'match.space',
  'match.space.venue',
  'match.space.venue.city',
  'match.space.venue.owner',
  'match.space.venue.sports',
  'match.space.sports',
  'match.sport',
];

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    @InjectRepository(MatchPlayer)
    private readonly players: Repository<MatchPlayer>,
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    private readonly notifications: NotificationsService,
  ) {}

  async findMine(user: AuthenticatedUser): Promise<BookingSummaryModel[]> {
    const rows = await this.bookings
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.match', 'match')
      .leftJoinAndSelect('match.space', 'space')
      .leftJoinAndSelect('space.venue', 'venue')
      .leftJoinAndSelect('venue.city', 'city')
      .leftJoinAndSelect('venue.sports', 'venueSport')
      .leftJoinAndSelect('space.sports', 'spaceSport')
      .leftJoinAndSelect('match.sport', 'sport')
      .where(
        `match.creator_id = :userId OR EXISTS (
          SELECT 1 FROM match_players mp
          WHERE mp.match_id = match.id AND mp.user_id = :userId
            AND mp.status <> :cancelledPlayer
        )`,
        { userId: user.id, cancelledPlayer: MatchPlayerStatus.Cancelled },
      )
      .orderBy('match.match_date', 'DESC')
      .addOrderBy('match.start_time', 'DESC')
      .getMany();

    const counts = await this.joinedCounts(rows.map((booking) => booking.matchId));
    return rows.map((booking) => toBookingSummary(booking, counts.get(booking.matchId) ?? 0));
  }

  async findOne(id: string, user: AuthenticatedUser): Promise<BookingDetailsModel> {
    const booking = await this.loadBooking(id);
    await this.assertCanView(booking, user);
    return this.buildDetails(booking);
  }

  async cancel(id: string, user: AuthenticatedUser): Promise<BookingDetailsModel> {
    const booking = await this.loadBooking(id);
    const match = booking.match;

    if (match.creatorId !== user.id && user.role !== UserRole.Admin) {
      throw new ForbiddenException('Solo el organizador puede cancelar la reserva');
    }

    if (
      booking.status === BookingStatus.Cancelled ||
      booking.status === BookingStatus.Rejected
    ) {
      return this.buildDetails(booking);
    }

    const venue = match.space.venue;
    const startsAt = new Date(`${match.matchDate}T${match.startTime}`);
    const deadline = new Date(startsAt.getTime() - venue.cancelWindowHours * 60 * 60 * 1000);
    const refundable = new Date() <= deadline;

    await this.bookings.manager.transaction(async (manager) => {
      if (refundable) {
        await manager
          .createQueryBuilder()
          .update(Payment)
          .set({ status: PaymentStatus.Refunded })
          .where('booking_id = :bookingId', { bookingId: booking.id })
          .andWhere('status = :status', { status: PaymentStatus.Paid })
          .execute();
      }

      booking.status = BookingStatus.Cancelled;
      await manager.save(booking);

      match.status = MatchStatus.Cancelled;
      await manager.save(match);

      await manager
        .createQueryBuilder()
        .update(MatchPlayer)
        .set({ status: MatchPlayerStatus.Cancelled })
        .where('match_id = :matchId', { matchId: match.id })
        .execute();
    });

    const players = await this.players.find({
      where: { match: { id: match.id } },
      relations: ['user'],
    });

    await this.notifications.createMany(
      players.map((player) => player.userId).filter((userId) => userId !== user.id),
      NotificationType.Booking,
      'Reserva cancelada',
      `La reserva ${booking.code} fue cancelada. ${
        refundable ? 'El anticipo será reembolsado.' : 'El anticipo no es reembolsable.'
      }`,
    );

    return this.findOne(id, user);
  }

  private async loadBooking(id: string): Promise<Booking> {
    const booking = await this.bookings.findOne({
      where: { id },
      relations: DETAIL_RELATIONS,
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return booking;
  }

  private async assertCanView(booking: Booking, user: AuthenticatedUser): Promise<void> {
    if (user.role === UserRole.Admin || booking.match.creatorId === user.id) {
      return;
    }

    if (booking.match.space.venue.ownerId === user.id) {
      return;
    }

    const player = await this.players.findOne({
      where: { match: { id: booking.matchId }, user: { id: user.id } },
    });

    if (!player || player.status === MatchPlayerStatus.Cancelled) {
      throw new ForbiddenException('No tienes acceso a esta reserva');
    }
  }

  private async buildDetails(booking: Booking): Promise<BookingDetailsModel> {
    const players = await this.players.find({
      where: { match: { id: booking.matchId } },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    const joined = players.filter(
      (player) =>
        player.status === MatchPlayerStatus.Joined || player.status === MatchPlayerStatus.Paid,
    ).length;

    return toBookingDetails(booking, joined, players);
  }

  private async joinedCounts(matchIds: string[]): Promise<Map<string, number>> {
    const unique = [...new Set(matchIds)];
    if (!unique.length) {
      return new Map();
    }

    const rows = await this.players
      .createQueryBuilder('player')
      .select('player.match_id', 'matchId')
      .addSelect('COUNT(*)', 'count')
      .where('player.match_id IN (:...matchIds)', { matchIds: unique })
      .andWhere('player.status IN (:...statuses)', {
        statuses: [MatchPlayerStatus.Joined, MatchPlayerStatus.Paid],
      })
      .groupBy('player.match_id')
      .getRawMany<{ matchId: string; count: string }>();

    return new Map(rows.map((row) => [row.matchId, Number(row.count)]));
  }
}
