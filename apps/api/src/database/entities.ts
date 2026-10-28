import { City } from '../modules/cities/entities/city.entity';
import { Sport } from '../modules/sports/entities/sport.entity';
import { User } from '../modules/users/entities/user.entity';
import { Venue } from '../modules/venues/entities/venue.entity';
import { Space } from '../modules/spaces/entities/space.entity';
import { Schedule } from '../modules/spaces/entities/schedule.entity';
import { Block } from '../modules/spaces/entities/block.entity';
import { Match } from '../modules/matches/entities/match.entity';
import { MatchPlayer } from '../modules/matches/entities/match-player.entity';
import { Booking } from '../modules/bookings/entities/booking.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';

export const entities = [
  City,
  Sport,
  User,
  Venue,
  Space,
  Schedule,
  Block,
  Match,
  MatchPlayer,
  Booking,
  Payment,
  Notification,
];
