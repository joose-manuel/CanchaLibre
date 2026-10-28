import {
  BalanceMethod,
  BookingStatus,
  MatchFormat,
  MatchStatus,
  PaymentStatus,
  PlayerLevel,
  SpaceType,
  UserRole,
} from '@canchalibre/shared-domain';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Player]: 'Jugador',
  [UserRole.Owner]: 'Propietario',
  [UserRole.Admin]: 'Administrador',
};

export const PLAYER_LEVEL_LABELS: Record<PlayerLevel, string> = {
  [PlayerLevel.Beginner]: 'Principiante',
  [PlayerLevel.Intermediate]: 'Intermedio',
  [PlayerLevel.SemiPro]: 'Semi-pro',
  [PlayerLevel.Pro]: 'Pro',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: 'Pendiente',
  [BookingStatus.Paid]: 'Pagada',
  [BookingStatus.Confirmed]: 'Confirmada',
  [BookingStatus.Cancelled]: 'Cancelada',
  [BookingStatus.Rejected]: 'Rechazada',
  [BookingStatus.NoShow]: 'No asistió',
};

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  [MatchStatus.Planned]: 'Planeado',
  [MatchStatus.Confirmed]: 'Confirmado',
  [MatchStatus.Cancelled]: 'Cancelado',
  [MatchStatus.Finished]: 'Finalizado',
};

export const MATCH_FORMAT_LABELS: Record<MatchFormat, string> = {
  [MatchFormat.FiveVFive]: 'Fútbol 5 vs 5',
  [MatchFormat.SevenVSeven]: 'Fútbol 7 vs 7',
  [MatchFormat.Other]: 'Otro formato',
};

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  [SpaceType.Indoor]: 'Cubierta',
  [SpaceType.Outdoor]: 'Descubierta',
};

export const BALANCE_METHOD_LABELS: Record<BalanceMethod, string> = {
  [BalanceMethod.App]: 'Saldo en la app',
  [BalanceMethod.Venue]: 'Saldo en la sede',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Initiated]: 'Iniciado',
  [PaymentStatus.Paid]: 'Pagado',
  [PaymentStatus.Failed]: 'Fallido',
  [PaymentStatus.Refunded]: 'Reembolsado',
};

export const SPORT_ICONS: Record<string, string> = {
  fútbol: 'football-outline',
  futbol: 'football-outline',
  pádel: 'tennisball-outline',
  padel: 'tennisball-outline',
  básquet: 'basketball-outline',
  basquet: 'basketball-outline',
  tenis: 'tennisball-outline',
  tenis2: 'tennisball-outline',
  vóleibol: 'american-football-outline',
  voleibol: 'american-football-outline',
};

export function sportIcon(name: string | null | undefined): string {
  return SPORT_ICONS[(name ?? '').toLowerCase()] ?? 'football-outline';
}

export function statusColor(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.Confirmed:
    case BookingStatus.Paid:
      return 'success';
    case BookingStatus.Pending:
      return 'warning';
    case BookingStatus.Cancelled:
    case BookingStatus.Rejected:
    case BookingStatus.NoShow:
      return 'danger';
    default:
      return 'medium';
  }
}
