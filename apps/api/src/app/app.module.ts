import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import configuration from '../config/configuration';
import { DatabaseModule } from '../database/database.module';
import { SeedModule } from '../database/seed.module';
import { AuthModule } from '../modules/auth/auth.module';
import { BookingsModule } from '../modules/bookings/bookings.module';
import { CitiesModule } from '../modules/cities/cities.module';
import { MatchesModule } from '../modules/matches/matches.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { OwnerModule } from '../modules/owner/owner.module';
import { PaymentsModule } from '../modules/payments/payments.module';
import { SpacesModule } from '../modules/spaces/spaces.module';
import { SportsModule } from '../modules/sports/sports.module';
import { UsersModule } from '../modules/users/users.module';
import { VenuesModule } from '../modules/venues/venues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CitiesModule,
    SportsModule,
    VenuesModule,
    SpacesModule,
    MatchesModule,
    BookingsModule,
    PaymentsModule,
    NotificationsModule,
    OwnerModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
