import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  AvailabilitySlot,
  Space as SpaceModel,
  SpaceBlock,
} from '@canchalibre/shared-domain';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { SetSchedulesDto } from './dto/set-schedules.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { SpacesService } from './spaces.service';

@ApiTags('spaces')
@Controller()
export class SpacesController {
  constructor(private readonly spaces: SpacesService) {}

  @ApiBearerAuth()
  @Post('venues/:venueId/spaces')
  create(
    @Param('venueId', ParseUUIDPipe) venueId: string,
    @Body() dto: CreateSpaceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SpaceModel> {
    return this.spaces.create(venueId, dto, user);
  }

  @Public()
  @Get('spaces/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SpaceModel> {
    return this.spaces.findOne(id);
  }

  @Public()
  @Get('spaces/:id/availability')
  availability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AvailabilityQueryDto,
  ): Promise<AvailabilitySlot[]> {
    return this.spaces.availability(id, query);
  }

  @ApiBearerAuth()
  @Put('spaces/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpaceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SpaceModel> {
    return this.spaces.update(id, dto, user);
  }

  @ApiBearerAuth()
  @Delete('spaces/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.spaces.remove(id, user);
  }

  @ApiBearerAuth()
  @Put('spaces/:id/schedules')
  setSchedules(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetSchedulesDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SpaceModel> {
    return this.spaces.setSchedules(id, dto, user);
  }

  @ApiBearerAuth()
  @Get('spaces/:id/blocks')
  listBlocks(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SpaceBlock[]> {
    return this.spaces.listBlocks(id, user);
  }

  @ApiBearerAuth()
  @Post('spaces/:id/blocks')
  createBlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateBlockDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SpaceBlock> {
    return this.spaces.createBlock(id, dto, user);
  }

  @ApiBearerAuth()
  @Delete('spaces/:id/blocks/:blockId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('blockId', ParseUUIDPipe) blockId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.spaces.removeBlock(id, blockId, user);
  }
}
