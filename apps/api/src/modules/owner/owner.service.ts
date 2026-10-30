import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BookingStatus,
  MatchStatus,
  NotificationType,
  OwnerDashboard as OwnerDashboardModel,
  OwnerFinanceSummary as OwnerFinanceSummaryModel,
  OwnerScheduleItem,
  PaymentStatus,
  PaymentType,
  UserRole,
} from '@canchalibre/shared-domain';
import { toIsoDate, todayIso } from '@canchalibre/shared-utils';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { toPaymentModel, toVenueSummary } from '../../common/mappers/api.mapper';
import { Booking } from '../bookings/entities/booking.entity';
import { Match } from '../matches/entities/match.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Payment } from '../payments/entities/payment.entity';
import { Venue } from '../venues/entities/venue.entity';
import { FinanceQueryDto } from './dto/finance-query.dto';
import { OwnerScheduleQueryDto } from './dto/owner-schedule-query.dto';

const SCHEDULE_RELATIONS = [
  'match',
  'match.creator',
  'match.space',
  'match.space.venue',
  'match.players',
  'match.players.user',
];

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    @InjectRepository(Venue)
    private readonly venues: Repository<Venue>,
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    private readonly notifications: NotificationsService,
  ) {}

  async schedule(
    query: OwnerScheduleQueryDto,
    user: AuthenticatedUser,
  ): Promise<OwnerScheduleItem[]> {
    const date = query.date ?? todayIso();

    const rows = await this.bookingsQuery(user)
      .andWhere('match.match_date = :date', { date })
      .andWhere('booking.status <> :cancelled', { cancelled: BookingStatus.Cancelled })
      .orderBy('match.start_time', 'ASC')
      .getMany();

    return rows.map((booking) => this.toScheduleItem(booking));
  }

  /**
   * Todas las reservas de las sedes del propietario, sin filtro de fecha.
   *
   * Es la lista de reservas de la sección de administración: incluye las
   * canceladas (para poder verlas) y ordena por fecha descendente.
   */
  async listBookings(user: AuthenticatedUser): Promise<OwnerScheduleItem[]> {
    const rows = await this.bookingsQuery(user)
      .orderBy('match.match_date', 'DESC')
      .addOrderBy('match.start_time', 'DESC')
      .getMany();

    return rows.map((booking) => this.toScheduleItem(booking));
  }

  async dashboard(user: AuthenticatedUser): Promise<OwnerDashboardModel> {
    const [venues, todayBookings, finance, pendingBookings] = await Promise.all([
      this.venues.find({
        where: { owner: { id: user.id } },
        relations: ['city', 'sports', 'spaces'],
        order: { name: 'ASC' },
      }),
      this.schedule({}, user),
      this.finance({ period: 'month' }, user),
      this.bookings
        .createQueryBuilder('booking')
        .leftJoin('booking.match', 'match')
        .leftJoin('match.space', 'space')
        .leftJoin('space.venue', 'venue')
        .where('venue.owner_id = :ownerId', { ownerId: user.id })
        .andWhere('booking.status = :status', { status: BookingStatus.Pending })
        .getCount(),
    ]);

    return {
      venues: venues.map((venue) => toVenueSummary(venue)),
      todayBookings,
      monthIncome: finance.totalPaid,
      pendingBookings,
    };
  }

  async finance(
    query: FinanceQueryDto,
    user: AuthenticatedUser,
  ): Promise<OwnerFinanceSummaryModel> {
    const { from, to } = this.periodRange(query.period);

    const qb = this.payments
      .createQueryBuilder('payment')
      .innerJoin('payment.booking', 'booking')
      .innerJoin('booking.match', 'match')
      .innerJoin('match.space', 'space')
      .innerJoin('space.venue', 'venue')
      .where('venue.owner_id = :ownerId', { ownerId: user.id })
      .andWhere('payment.created_at BETWEEN :from AND :to', { from, to })
      .orderBy('payment.created_at', 'DESC');

    if (query.venueId) {
      qb.andWhere('venue.id = :venueId', { venueId: query.venueId });
    }

    const rows = await qb.getMany();
    const paid = rows.filter((payment) => payment.status === PaymentStatus.Paid);
    const totalDeposits = paid
      .filter((payment) => payment.type === PaymentType.Deposit)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const totalPaid = paid.reduce((sum, payment) => sum + payment.amount, 0);
    const pending = rows
      .filter((payment) => payment.status === PaymentStatus.Initiated)
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      period: query.period,
      from: toIsoDate(from),
      to: toIsoDate(to),
      totalDeposits,
      totalPaid,
      pending,
      payments: rows.map(toPaymentModel),
    };
  }

  async confirm(bookingId: string, user: AuthenticatedUser): Promise<OwnerScheduleItem> {
    const booking = await this.loadBooking(bookingId, user);
    booking.status = BookingStatus.Confirmed;
    booking.match.status = MatchStatus.Confirmed;
    await this.bookings.save(booking);
    await this.matches.save(booking.match);

    await this.notifications.create(
      booking.match.creatorId,
      NotificationType.Booking,
      'Reserva confirmada',
      `La sede confirmó tu reserva ${booking.code}.`,
    );

    return this.toScheduleItem(booking);
  }

  async reject(bookingId: string, user: AuthenticatedUser): Promise<OwnerScheduleItem> {
    const booking = await this.loadBooking(bookingId, user);
    booking.status = BookingStatus.Rejected;
    booking.match.status = MatchStatus.Cancelled;
    await this.bookings.save(booking);
    await this.matches.save(booking.match);

    await this.notifications.createMany(
      (booking.match.players ?? []).map((player) => player.userId),
      NotificationType.Booking,
      'Reserva rechazada',
      `La sede rechazó la reserva ${booking.code}.`,
    );

    return this.toScheduleItem(booking);
  }

  async noShow(bookingId: string, user: AuthenticatedUser): Promise<OwnerScheduleItem> {
    const booking = await this.loadBooking(bookingId, user);
    booking.status = BookingStatus.NoShow;
    booking.match.status = MatchStatus.Finished;
    await this.bookings.save(booking);
    await this.matches.save(booking.match);

    await this.notifications.create(
      booking.match.creatorId,
      NotificationType.Booking,
      'No-show registrado',
      `La sede registró inasistencia para la reserva ${booking.code}.`,
    );

    return this.toScheduleItem(booking);
  }

  /** Consulta base: todas las reservas de las sedes del propietario. */
  private bookingsQuery(user: AuthenticatedUser) {
    return this.bookings
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.match', 'match')
      .leftJoinAndSelect('match.creator', 'creator')
      .leftJoinAndSelect('match.space', 'space')
      .leftJoinAndSelect('space.venue', 'venue')
      .where('venue.owner_id = :ownerId', { ownerId: user.id });
  }

  private async loadBooking(bookingId: string, user: AuthenticatedUser): Promise<Booking> {
    const booking = await this.bookings.findOne({
      where: { id: bookingId },
      relations: SCHEDULE_RELATIONS,
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const isOwner = booking.match.space.venue.ownerId === user.id;
    if (!isOwner && user.role !== UserRole.Admin) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return booking;
  }

  private toScheduleItem(booking: Booking): OwnerScheduleItem {
    return {
      bookingId: booking.id,
      code: booking.code,
      status: booking.status,
      matchDate: booking.match.matchDate,
      startTime: booking.match.startTime,
      endTime: booking.match.endTime,
      spaceName: booking.match.space.name,
      venueName: booking.match.space.venue.name,
      organizerName: booking.match.creator?.fullName ?? '',
      depositAmount: booking.depositAmount,
    };
  }

  private periodRange(period: FinanceQueryDto['period']): { from: Date; to: Date } {
    const to = new Date();
    to.setHours(23, 59, 59, 999);

    const from = new Date();
    from.setHours(0, 0, 0, 0);

    if (period === 'week') {
      from.setDate(from.getDate() - 6);
    } else if (period === 'month') {
      from.setDate(from.getDate() - 29);
    }

    return { from, to };
  }
}
