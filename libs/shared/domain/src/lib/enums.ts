/**
 * Enumeraciones compartidas entre API, web y móvil.
 * Los valores coinciden con los almacenados en PostgreSQL.
 */

export enum UserRole {
  Player = 'player',
  Owner = 'owner',
  Admin = 'admin',
}

export enum PlayerLevel {
  Beginner = 'principiante',
  Intermediate = 'intermedio',
  SemiPro = 'semi-pro',
  Pro = 'pro',
}

export enum VenueStatus {
  Draft = 'draft',
  Active = 'active',
  Suspended = 'suspended',
}

export enum BalanceMethod {
  App = 'app',
  Venue = 'venue',
}

export enum SpaceType {
  Indoor = 'indoor',
  Outdoor = 'outdoor',
}

export enum SpaceStatus {
  Active = 'active',
  Maintenance = 'maintenance',
  Inactive = 'inactive',
}

export enum BlockReason {
  Maintenance = 'maintenance',
  Closed = 'closed',
  Manual = 'manual',
}

export enum MatchFormat {
  FiveVFive = '5v5',
  SevenVSeven = '7v7',
  Other = 'other',
}

export enum MatchStatus {
  Planned = 'planned',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Finished = 'finished',
}

export enum MatchPlayerRole {
  Organizer = 'organizer',
  Player = 'player',
}

export enum MatchPlayerStatus {
  Invited = 'invited',
  Joined = 'joined',
  Paid = 'paid',
  Cancelled = 'cancelled',
}

export enum BookingStatus {
  Pending = 'pending',
  Paid = 'paid',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Rejected = 'rejected',
  NoShow = 'no_show',
}

export enum PaymentType {
  Deposit = 'deposit',
  Share = 'share',
  Balance = 'balance',
  Refund = 'refund',
}

export enum PaymentMethod {
  Card = 'card',
  Nequi = 'nequi',
  Pse = 'pse',
  Cash = 'cash',
  Sandbox = 'sandbox',
}

export enum PaymentStatus {
  Initiated = 'initiated',
  Paid = 'paid',
  Failed = 'failed',
  Refunded = 'refunded',
}

export enum NotificationType {
  Booking = 'booking',
  Payment = 'payment',
  Match = 'match',
  System = 'system',
}

export type FinancePeriod = 'day' | 'week' | 'month';
