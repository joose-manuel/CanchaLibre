import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  BookingDetails as BookingDetailsModel,
  BookingSummary as BookingSummaryModel,
} from '@canchalibre/shared-domain';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { BookingsService } from './bookings.service';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get('mine')
  findMine(@CurrentUser() user: AuthenticatedUser): Promise<BookingSummaryModel[]> {
    return this.bookings.findMine(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BookingDetailsModel> {
    return this.bookings.findOne(id, user);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BookingDetailsModel> {
    return this.bookings.cancel(id, user);
  }
}
