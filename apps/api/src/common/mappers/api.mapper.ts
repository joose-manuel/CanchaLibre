import {
  BookingDetails as BookingDetailsModel,
  BookingSummary as BookingSummaryModel,
  MatchDetails as MatchDetailsModel,
  MatchPlayer as MatchPlayerModel,
  MatchSummary as MatchSummaryModel,
  Notification as NotificationModel,
  Payment as PaymentModel,
  Space as SpaceModel,
  SpaceStatus,
  User as UserModel,
  VenueDetails as VenueDetailsModel,
  VenueSummary as VenueSummaryModel,
} from '@canchalibre/shared-domain';
import { Booking } from '../../modules/bookings/entities/booking.entity';
import { MatchPlayer } from '../../modules/matches/entities/match-player.entity';
import { Match } from '../../modules/matches/entities/match.entity';
import { Notification } from '../../modules/notifications/entities/notification.entity';
import { Payment } from '../../modules/payments/entities/payment.entity';
import { Space } from '../../modules/spaces/entities/space.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Venue } from '../../modules/venues/entities/venue.entity';

export function toUserModel(user: User): UserModel {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    level: user.level,
    cityId: user.cityId,
    city: user.city ?? null,
    createdAt: toIso(user.createdAt),
    updatedAt: toIso(user.updatedAt),
  };
}

export function toSpaceModel(space: Space): SpaceModel {
  return {
    id: space.id,
    venueId: space.venueId,
    name: space.name,
    capacity: space.capacity,
    type: space.type,
    pricePerHour: space.pricePerHour,
    status: space.status,
    sports: space.sports ?? [],
    schedules: (space.schedules ?? []).map((schedule) => ({
      id: schedule.id,
      spaceId: schedule.spaceId,
      dayOfWeek: schedule.dayOfWeek,
      openTime: schedule.openTime,
      closeTime: schedule.closeTime,
    })),
  };
}

export function toVenueSummary(venue: Venue, distanceKm?: number): VenueSummaryModel {
  const activeSpaces = (venue.spaces ?? []).filter((space) => space.status === SpaceStatus.Active);
  const prices = activeSpaces.map((space) => space.pricePerHour);

  return {
    id: venue.id,
    ownerId: venue.ownerId,
    cityId: venue.cityId,
    name: venue.name,
    address: venue.address,
    phone: venue.phone,
    lat: venue.lat,
    lng: venue.lng,
    depositPercent: venue.depositPercent,
    cancelWindowHours: venue.cancelWindowHours,
    balanceMethod: venue.balanceMethod,
    status: venue.status,
    coverUrl: venue.coverUrl,
    city: venue.city,
    sports: venue.sports ?? [],
    spaceCount: venue.spaces ? venue.spaces.length : undefined,
    priceFrom: prices.length ? Math.min(...prices) : undefined,
    distanceKm,
  };
}

export function toVenueDetails(venue: Venue): VenueDetailsModel {
  const summary = toVenueSummary(venue);
  return {
    ...summary,
    owner: venue.owner
      ? {
          id: venue.owner.id,
          fullName: venue.owner.fullName,
          phone: venue.owner.phone,
        }
      : undefined,
    spaces: (venue.spaces ?? [])
      .filter((space) => space.status !== SpaceStatus.Inactive)
      .map(toSpaceModel),
  };
}

export function toMatchSummary(match: Match, joinedPlayers = 0): MatchSummaryModel {
  const venue = match.space?.venue ? toVenueSummary(match.space.venue) : null;
  const space = match.space ? toSpaceModel(match.space) : null;
  const pricePerPlayer =
    match.capacity > 0 ? Math.ceil(match.priceTotal / match.capacity) : match.priceTotal;

  return {
    id: match.id,
    spaceId: match.spaceId,
    creatorId: match.creatorId,
    sportId: match.sportId,
    matchDate: match.matchDate,
    startTime: match.startTime,
    endTime: match.endTime,
    format: match.format,
    capacity: match.capacity,
    priceTotal: match.priceTotal,
    status: match.status,
    availableSpots: Math.max(0, match.capacity - joinedPlayers),
    joinedPlayers,
    pricePerPlayer,
    venue,
    space,
    sport: match.sport ?? null,
  };
}

export function toMatchPlayerModel(player: MatchPlayer): MatchPlayerModel {
  return {
    id: player.id,
    matchId: player.matchId,
    userId: player.userId,
    role: player.role,
    status: player.status,
    user: player.user
      ? {
          id: player.user.id,
          fullName: player.user.fullName,
          avatarUrl: player.user.avatarUrl,
          level: player.user.level,
        }
      : undefined,
  };
}

export function toMatchDetails(match: Match, joinedPlayers: number, booking: Booking | null): MatchDetailsModel {
  return {
    ...toMatchSummary(match, joinedPlayers),
    players: (match.players ?? []).map(toMatchPlayerModel),
    booking: booking ? toBookingSummary(booking) : null,
  };
}

export function toBookingSummary(booking: Booking, joinedPlayers = 0): BookingSummaryModel {
  return {
    id: booking.id,
    matchId: booking.matchId,
    code: booking.code,
    status: booking.status,
    depositAmount: booking.depositAmount,
    serviceFee: booking.serviceFee,
    createdAt: toIso(booking.createdAt),
    updatedAt: toIso(booking.updatedAt),
    match: booking.match ? toMatchSummary(booking.match, joinedPlayers) : undefined,
  };
}

export function toBookingDetails(
  booking: Booking,
  joinedPlayers: number,
  players: MatchPlayer[],
): BookingDetailsModel {
  return {
    ...toBookingSummary(booking, joinedPlayers),
    qrPayload: `canchalibre://booking/${booking.code}?id=${booking.id}`,
    players: players.map(toMatchPlayerModel),
  };
}

export function toPaymentModel(payment: Payment): PaymentModel {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    userId: payment.userId,
    amount: payment.amount,
    type: payment.type,
    method: payment.method,
    status: payment.status,
    gatewayRef: payment.gatewayRef,
    paidAt: payment.paidAt ? toIso(payment.paidAt) : null,
    createdAt: toIso(payment.createdAt),
  };
}

export function toNotificationModel(notification: Notification): NotificationModel {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    readAt: notification.readAt ? toIso(notification.readAt) : null,
    createdAt: toIso(notification.createdAt),
  };
}

export function toIso(value: Date | string | null | undefined): string {
  if (!value) {
    return new Date(0).toISOString();
  }
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
