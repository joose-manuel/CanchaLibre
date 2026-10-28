import {
  BalanceMethod,
  BlockReason,
  BookingStatus,
  MatchFormat,
  MatchPlayerRole,
  MatchPlayerStatus,
  MatchStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  PlayerLevel,
  SpaceStatus,
  SpaceType,
  UserRole,
  VenueStatus,
} from './enums';

export interface City {
  id: string;
  name: string;
  department: string;
  lat: number;
  lng: number;
}

export interface Sport {
  id: number;
  name: string;
  iconUrl: string | null;
}

export interface UserSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  level: PlayerLevel;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  level: PlayerLevel;
  cityId: string | null;
  city?: City | null;
  createdAt: string;
  updatedAt: string;
}

export interface VenueOwner {
  id: string;
  fullName: string;
  phone: string | null;
}

export interface VenueSummary {
  id: string;
  ownerId: string;
  cityId: string;
  name: string;
  address: string;
  phone: string | null;
  lat: number;
  lng: number;
  depositPercent: number;
  cancelWindowHours: number;
  balanceMethod: BalanceMethod;
  status: VenueStatus;
  coverUrl: string | null;
  city: City;
  sports: Sport[];
  spaceCount?: number;
  priceFrom?: number;
  distanceKm?: number;
}

export interface VenueDetails extends VenueSummary {
  owner?: VenueOwner;
  spaces: Space[];
}

export interface Schedule {
  id: string;
  spaceId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface Space {
  id: string;
  venueId: string;
  name: string;
  capacity: number;
  type: SpaceType;
  pricePerHour: number;
  status: SpaceStatus;
  sports: Sport[];
  schedules?: Schedule[];
}

export interface SpaceBlock {
  id: string;
  spaceId: string;
  startAt: string;
  endAt: string;
  reason: BlockReason;
  createdAt: string;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price: number;
  reason?: string;
}

export interface MatchSummary {
  id: string;
  spaceId: string;
  creatorId: string;
  sportId: number;
  matchDate: string;
  startTime: string;
  endTime: string;
  format: MatchFormat;
  capacity: number;
  priceTotal: number;
  status: MatchStatus;
  availableSpots: number;
  joinedPlayers: number;
  pricePerPlayer: number;
  venue: VenueSummary | null;
  space: Space | null;
  sport: Sport | null;
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  userId: string;
  role: MatchPlayerRole;
  status: MatchPlayerStatus;
  user?: UserSummary;
}

export interface BookingSummary {
  id: string;
  matchId: string;
  code: string;
  status: BookingStatus;
  depositAmount: number;
  serviceFee: number;
  createdAt: string;
  updatedAt: string;
  match?: MatchSummary;
}

export interface BookingDetails extends BookingSummary {
  qrPayload: string;
  players?: MatchPlayer[];
}

export interface MatchDetails extends MatchSummary {
  players: MatchPlayer[];
  booking: BookingSummary | null;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayRef: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface OwnerScheduleItem {
  bookingId: string;
  code: string;
  status: BookingStatus;
  matchDate: string;
  startTime: string;
  endTime: string;
  spaceName: string;
  venueName: string;
  organizerName: string;
  depositAmount: number;
}

export interface OwnerFinanceSummary {
  period: 'day' | 'week' | 'month';
  from: string;
  to: string;
  totalDeposits: number;
  totalPaid: number;
  pending: number;
  payments: Payment[];
}

export interface OwnerDashboard {
  venues: VenueSummary[];
  todayBookings: OwnerScheduleItem[];
  monthIncome: number;
  pendingBookings: number;
}
