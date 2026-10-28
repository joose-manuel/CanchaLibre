import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import {
  VenueDetails as VenueDetailsModel,
  VenueSummary as VenueSummaryModel,
} from '@canchalibre/shared-domain';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenuePoliciesDto } from './dto/venue-policies.dto';
import { VenueQueryDto } from './dto/venue-query.dto';
import { VenuesService } from './venues.service';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venues: VenuesService) {}

  @Public()
  @Get()
  findAll(@Query() query: VenueQueryDto): Promise<VenueSummaryModel[]> {
    return this.venues.findAll(query);
  }

  @ApiBearerAuth()
  @Get('mine')
  findMine(@CurrentUser() user: AuthenticatedUser): Promise<VenueSummaryModel[]> {
    return this.venues.findMine(user);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<VenueDetailsModel> {
    return this.venues.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  create(
    @Body() dto: CreateVenueDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VenueDetailsModel> {
    return this.venues.create(dto, user);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVenueDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VenueDetailsModel> {
    return this.venues.update(id, dto, user);
  }

  @ApiBearerAuth()
  @Put(':id/policies')
  updatePolicies(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VenuePoliciesDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VenueDetailsModel> {
    return this.venues.updatePolicies(id, dto, user);
  }
}
