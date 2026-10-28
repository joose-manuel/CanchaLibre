import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../matches/entities/match.entity';
import { Sport } from '../sports/entities/sport.entity';
import { VenuesModule } from '../venues/venues.module';
import { Block } from './entities/block.entity';
import { Schedule } from './entities/schedule.entity';
import { Space } from './entities/space.entity';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Space, Schedule, Block, Match, Sport]),
    VenuesModule,
  ],
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule {}
