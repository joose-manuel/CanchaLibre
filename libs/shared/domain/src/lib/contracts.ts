import {
  BalanceMethod,
  BlockReason,
  FinancePeriod,
  MatchFormat,
  PaymentMethod,
  PlayerLevel,
  SpaceType,
  UserRole,
} from './enums';
import { Sport, User } from './models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  cityId?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  cityId?: string;
  level?: PlayerLevel;
  avatarUrl?: string;
}

export interface UpdateRoleRequest {
  role: UserRole;
}

export interface VenueFilters {
  cityId?: string;
  sportId?: number;
  q?: string;
  lat?: number;
  lng?: number;
}

export interface MatchFilters {
  cityId?: string;
  date?: string;
  sportId?: number;
  status?: string;
}

export interface CreateVenueRequest {
  name: string;
  address: string;
  cityId: string;
  phone?: string;
  lat: number;
  lng: number;
  depositPercent: number;
  cancelWindowHours: number;
  balanceMethod: BalanceMethod;
  sportIds: number[];
  coverUrl?: string;
}

export type UpdateVenueRequest = Partial<CreateVenueRequest>;

export interface VenuePoliciesRequest {
  depositPercent: number;
  cancelWindowHours: number;
  balanceMethod: BalanceMethod;
}

export interface CreateSpaceRequest {
  name: string;
  capacity: number;
  type: SpaceType;
  pricePerHour: number;
  sportIds?: number[];
}

export interface UpdateSpaceRequest extends Partial<CreateSpaceRequest> {
  status?: 'active' | 'maintenance' | 'inactive';
}

export interface ScheduleInput {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface SetSchedulesRequest {
  schedules: ScheduleInput[];
}

export interface CreateBlockRequest {
  startAt: string;
  endAt: string;
  reason: BlockReason;
}

export interface CreateMatchRequest {
  spaceId: string;
  sportId: number;
  matchDate: string;
  startTime: string;
  endTime: string;
  format: MatchFormat;
  capacity: number;
  priceTotal?: number;
}

export interface PayDepositRequest {
  bookingId: string;
  method: PaymentMethod;
}

export interface PaymentWebhookRequest {
  gatewayRef: string;
  status: 'paid' | 'failed' | 'refunded';
}

export interface FinanceQuery {
  period: FinancePeriod;
  venueId?: string;
}

export type SportOption = Sport;

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}
