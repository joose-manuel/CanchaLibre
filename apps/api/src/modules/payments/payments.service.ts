import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BookingStatus,
  MatchPlayerStatus,
  MatchStatus,
  NotificationType,
  Payment as PaymentModel,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from '@canchalibre/shared-domain';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { toPaymentModel } from '../../common/mappers/api.mapper';
import { Booking } from '../bookings/entities/booking.entity';
import { MatchPlayer } from '../matches/entities/match-player.entity';
import { Match } from '../matches/entities/match.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PayDepositDto } from './dto/pay-deposit.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Payment } from './entities/payment.entity';

const BOOKING_RELATIONS = [
  'match',
  'match.creator',
  'match.space',
  'match.space.venue',
  'match.space.venue.owner',
];

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
    @InjectRepository(MatchPlayer)
    private readonly players: Repository<MatchPlayer>,
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async payDeposit(dto: PayDepositDto, user: AuthenticatedUser): Promise<PaymentModel> {
    const booking = await this.bookings.findOne({
      where: { id: dto.bookingId },
      relations: BOOKING_RELATIONS,
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (
      booking.status === BookingStatus.Cancelled ||
      booking.status === BookingStatus.Rejected
    ) {
      throw new BadRequestException('La reserva está cancelada');
    }

    const isOrganizer = booking.match.creatorId === user.id;
    const player = await this.players.findOne({
      where: { match: { id: booking.matchId }, user: { id: user.id } },
    });

    if (!isOrganizer && (!player || player.status === MatchPlayerStatus.Cancelled)) {
      throw new ForbiddenException('No participas en esta reserva');
    }

    const type = isOrganizer ? PaymentType.Deposit : PaymentType.Share;
    const amount = isOrganizer
      ? booking.depositAmount
      : Math.ceil(booking.match.priceTotal / booking.match.capacity);

    if (amount <= 0) {
      throw new BadRequestException('Esta reserva no requiere pago');
    }

    const alreadyPaid = await this.payments.findOne({
      where: {
        booking: { id: booking.id },
        user: { id: user.id },
        type,
        status: PaymentStatus.Paid,
      },
    });

    if (alreadyPaid) {
      throw new ConflictException('Ya registraste el pago de esta reserva');
    }

    const provider = this.config.get<string>('payments.provider', 'sandbox');
    const autoConfirm = provider === 'sandbox' || dto.method === PaymentMethod.Sandbox;
    const now = new Date();

    const payment = this.payments.create({
      booking: { id: booking.id },
      bookingId: booking.id,
      user: { id: user.id },
      userId: user.id,
      amount,
      type,
      method: dto.method,
      status: autoConfirm ? PaymentStatus.Paid : PaymentStatus.Initiated,
      gatewayRef: `${autoConfirm ? 'SBX' : 'PAY'}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      paidAt: autoConfirm ? now : null,
    });

    const saved = await this.payments.save(payment);

    if (autoConfirm) {
      await this.applyPaidStatus(booking, user.id);
    }

    await this.notifyPayment(saved, booking);

    return toPaymentModel(saved);
  }

  async webhook(dto: PaymentWebhookDto, secret: string | undefined): Promise<PaymentModel> {
    const expected = this.config.getOrThrow<string>('payments.webhookSecret');
    if (secret !== expected) {
      throw new UnauthorizedException('Firma de webhook inválida');
    }

    const payment = await this.payments.findOne({
      where: { gatewayRef: dto.gatewayRef },
      relations: ['booking', 'booking.match'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (dto.status === 'paid') {
      payment.status = PaymentStatus.Paid;
      payment.paidAt = payment.paidAt ?? new Date();
      await this.payments.save(payment);

      const booking = await this.bookings.findOne({
        where: { id: payment.bookingId },
        relations: BOOKING_RELATIONS,
      });
      if (booking) {
        await this.applyPaidStatus(booking, payment.userId);
        await this.notifyPayment(payment, booking);
      }
    } else if (dto.status === 'failed') {
      payment.status = PaymentStatus.Failed;
      await this.payments.save(payment);
    } else {
      payment.status = PaymentStatus.Refunded;
      await this.payments.save(payment);
    }

    return toPaymentModel(payment);
  }

  async findMine(userId: string): Promise<PaymentModel[]> {
    const rows = await this.payments.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return rows.map(toPaymentModel);
  }

  private async applyPaidStatus(booking: Booking, userId: string): Promise<void> {
    const player = await this.players.findOne({
      where: { match: { id: booking.matchId }, user: { id: userId } },
    });

    if (player && player.status !== MatchPlayerStatus.Cancelled) {
      player.status = MatchPlayerStatus.Paid;
      await this.players.save(player);
    }

    if (booking.status === BookingStatus.Pending) {
      booking.status = BookingStatus.Paid;
      await this.bookings.save(booking);
    }

    const joined = await this.players.count({
      where: {
        match: { id: booking.matchId },
        status: MatchPlayerStatus.Paid,
      },
    });

    if (joined >= booking.match.capacity) {
      const match = await this.matches.findOne({ where: { id: booking.matchId } });
      if (match && match.status !== MatchStatus.Cancelled) {
        match.status = MatchStatus.Confirmed;
        await this.matches.save(match);

        booking.status = BookingStatus.Confirmed;
        await this.bookings.save(booking);
      }
    }
  }

  private async notifyPayment(payment: Payment, booking: Booking): Promise<void> {
    const title = payment.status === PaymentStatus.Paid ? 'Pago confirmado' : 'Pago iniciado';
    const body = `Reserva ${booking.code}: ${payment.amount} COP (${payment.type}).`;

    await this.notifications.create(
      booking.match.creatorId,
      NotificationType.Payment,
      title,
      body,
    );

    const ownerId = booking.match.space.venue.ownerId;
    if (ownerId && ownerId !== booking.match.creatorId) {
      await this.notifications.create(ownerId, NotificationType.Payment, title, body);
    }
  }
}
