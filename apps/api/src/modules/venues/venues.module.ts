import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitiesModule } from '../cities/cities.module';
import { SportsModule } from '../sports/sports.module';
import { UsersModule } from '../users/users.module';
import { Venue } from './entities/venue.entity';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';

@Module({
  imports: [TypeOrmModule.forFeature([Venue]), CitiesModule, SportsModule, UsersModule],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
