import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchPlayer } from '../matches/entities/match-player.entity';
import { Match } from '../matches/entities/match.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Payment } from '../payments/entities/payment.entity';
import { Booking } from './entities/booking.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Match, MatchPlayer, Payment]),
    NotificationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
