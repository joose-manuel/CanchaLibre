import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
  OwnerDashboard as OwnerDashboardModel,
  OwnerFinanceSummary as OwnerFinanceSummaryModel,
  OwnerScheduleItem,
  UserRole,
} from '@canchalibre/shared-domain';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { FinanceQueryDto } from './dto/finance-query.dto';
import { OwnerScheduleQueryDto } from './dto/owner-schedule-query.dto';
import { OwnerService } from './owner.service';

@ApiTags('owner')
@ApiBearerAuth()
@Roles(UserRole.Owner, UserRole.Admin)
@Controller('owner')
export class OwnerController {
  constructor(private readonly owner: OwnerService) {}

  @Get('schedule')
  schedule(
    @Query() query: OwnerScheduleQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OwnerScheduleItem[]> {
    return this.owner.schedule(query, user);
  }

  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthenticatedUser): Promise<OwnerDashboardModel> {
    return this.owner.dashboard(user);
  }

  @Get('finance')
  finance(
    @Query() query: FinanceQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OwnerFinanceSummaryModel> {
    return this.owner.finance(query, user);
  }

  @Post('bookings/:id/confirm')
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OwnerScheduleItem> {
    return this.owner.confirm(id, user);
  }

  @Post('bookings/:id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OwnerScheduleItem> {
    return this.owner.reject(id, user);
  }

  @Post('bookings/:id/no-show')
  noShow(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OwnerScheduleItem> {
    return this.owner.noShow(id, user);
  }
}
