import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
  MatchDetails as MatchDetailsModel,
  MatchSummary as MatchSummaryModel,
} from '@canchalibre/shared-domain';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchQueryDto } from './dto/match-query.dto';
import { MatchesService } from './matches.service';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Public()
  @Get()
  findAll(@Query() query: MatchQueryDto): Promise<MatchSummaryModel[]> {
    return this.matches.findAll(query);
  }

  @ApiBearerAuth()
  @Get('mine')
  findMine(@CurrentUser('id') userId: string): Promise<MatchSummaryModel[]> {
    return this.matches.findMine(userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MatchDetailsModel> {
    return this.matches.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  create(
    @Body() dto: CreateMatchDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MatchDetailsModel> {
    return this.matches.create(dto, user);
  }

  @ApiBearerAuth()
  @Post(':id/join')
  join(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MatchDetailsModel> {
    return this.matches.join(id, user);
  }

  @ApiBearerAuth()
  @Post(':id/leave')
  leave(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MatchDetailsModel> {
    return this.matches.leave(id, user);
  }

  @ApiBearerAuth()
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MatchDetailsModel> {
    return this.matches.cancel(id, user);
  }
}
