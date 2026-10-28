import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Match } from '../matches/entities/match.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Payment } from '../payments/entities/payment.entity';
import { Venue } from '../venues/entities/venue.entity';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Match, Venue, Payment]), NotificationsModule],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}
