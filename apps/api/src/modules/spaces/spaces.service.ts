import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import {
  AvailabilitySlot,
  BlockReason,
  MatchStatus,
  SpaceStatus,
  Space as SpaceModel,
  SpaceBlock,
} from '@canchalibre/shared-domain';
import { eachHour, timeToMinutes } from '@canchalibre/shared-utils';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { toSpaceModel } from '../../common/mappers/api.mapper';
import { Match } from '../matches/entities/match.entity';
import { Sport } from '../sports/entities/sport.entity';
import { VenuesService } from '../venues/venues.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { SetSchedulesDto } from './dto/set-schedules.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Block } from './entities/block.entity';
import { Schedule } from './entities/schedule.entity';
import { Space } from './entities/space.entity';

const SPACE_RELATIONS = ['venue', 'sports', 'schedules'];

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaces: Repository<Space>,
    @InjectRepository(Schedule)
    private readonly schedules: Repository<Schedule>,
    @InjectRepository(Block)
    private readonly blocks: Repository<Block>,
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    @InjectRepository(Sport)
    private readonly sports: Repository<Sport>,
    private readonly venues: VenuesService,
  ) {}

  async findOne(id: string): Promise<SpaceModel> {
    const space = await this.findEntity(id);
    if (space.status === SpaceStatus.Inactive) {
      throw new NotFoundException('Espacio no encontrado');
    }
    return toSpaceModel(space);
  }

  async findEntity(id: string): Promise<Space> {
    const space = await this.spaces.findOne({ where: { id }, relations: SPACE_RELATIONS });
    if (!space) {
      throw new NotFoundException('Espacio no encontrado');
    }
    return space;
  }

  async create(venueId: string, dto: CreateSpaceDto, user: AuthenticatedUser): Promise<SpaceModel> {
    const venue = await this.venues.assertOwner(venueId, user);
    const sports = await this.resolveSports(venue.sports, dto.sportIds);

    const space = this.spaces.create({
      venue: { id: venue.id },
      venueId: venue.id,
      name: dto.name.trim(),
      capacity: dto.capacity,
      type: dto.type,
      pricePerHour: dto.pricePerHour,
      status: SpaceStatus.Active,
      sports,
    });

    const saved = await this.spaces.save(space);
    const withRelations = await this.findEntity(saved.id);
    return toSpaceModel(withRelations);
  }

  async update(id: string, dto: UpdateSpaceDto, user: AuthenticatedUser): Promise<SpaceModel> {
    const space = await this.findEntity(id);
    const venue = await this.venues.assertOwner(space.venueId, user);

    if (dto.sportIds !== undefined) {
      space.sports = await this.resolveSports(venue.sports, dto.sportIds);
    }
    if (dto.name !== undefined) space.name = dto.name.trim();
    if (dto.capacity !== undefined) space.capacity = dto.capacity;
    if (dto.type !== undefined) space.type = dto.type;
    if (dto.pricePerHour !== undefined) space.pricePerHour = dto.pricePerHour;
    if (dto.status !== undefined) space.status = dto.status;

    await this.spaces.save(space);
    return toSpaceModel(await this.findEntity(id));
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const space = await this.findEntity(id);
    await this.venues.assertOwner(space.venueId, user);

    const hasMatches = await this.matches.exists({ where: { space: { id } } });
    if (hasMatches) {
      throw new BadRequestException(
        'No se puede eliminar un espacio con partidos. Cámbialo a inactivo.',
      );
    }

    await this.spaces.remove(space);
  }

  async setSchedules(
    id: string,
    dto: SetSchedulesDto,
    user: AuthenticatedUser,
  ): Promise<SpaceModel> {
    const space = await this.findEntity(id);
    await this.venues.assertOwner(space.venueId, user);

    const days = new Set<number>();
    for (const item of dto.schedules) {
      if (days.has(item.dayOfWeek)) {
        throw new BadRequestException('Sólo se permite un horario por día');
      }
      days.add(item.dayOfWeek);

      const open = normalizeTime(item.openTime);
      const close = normalizeTime(item.closeTime);
      if (timeToMinutes(open) >= timeToMinutes(close)) {
        throw new BadRequestException('La hora de apertura debe ser menor que la de cierre');
      }
    }

    await this.spaces.manager.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .delete()
        .from(Schedule)
        .where('space_id = :id', { id })
        .execute();
      if (!dto.schedules.length) {
        return;
      }
      const rows = dto.schedules.map((item) =>
        manager.create(Schedule, {
          space: { id },
          dayOfWeek: item.dayOfWeek,
          openTime: normalizeTime(item.openTime),
          closeTime: normalizeTime(item.closeTime),
        }),
      );
      await manager.save(rows);
    });

    return toSpaceModel(await this.findEntity(id));
  }

  async createBlock(id: string, dto: CreateBlockDto, user: AuthenticatedUser): Promise<SpaceBlock> {
    const space = await this.findEntity(id);
    await this.venues.assertOwner(space.venueId, user);

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new BadRequestException('Rango de bloqueo inválido');
    }
    if (startAt >= endAt) {
      throw new BadRequestException('La fecha inicial debe ser anterior a la final');
    }

    const block = this.blocks.create({
      space: { id },
      startAt,
      endAt,
      reason: dto.reason,
    });

    return this.toBlockModel(await this.blocks.save(block));
  }

  async listBlocks(id: string, user: AuthenticatedUser): Promise<SpaceBlock[]> {
    const space = await this.findEntity(id);
    await this.venues.assertOwner(space.venueId, user);

    const blocks = await this.blocks.find({
      where: { space: { id } },
      order: { startAt: 'ASC' },
    });

    return blocks.map((block) => this.toBlockModel(block));
  }

  async removeBlock(id: string, blockId: string, user: AuthenticatedUser): Promise<void> {
    const space = await this.findEntity(id);
    await this.venues.assertOwner(space.venueId, user);

    const block = await this.blocks.findOne({ where: { id: blockId, space: { id } } });
    if (!block) {
      throw new NotFoundException('Bloqueo no encontrado');
    }

    await this.blocks.remove(block);
  }

  async availability(id: string, query: AvailabilityQueryDto): Promise<AvailabilitySlot[]> {
    const space = await this.findEntity(id);
    const dayStart = new Date(`${query.date}T00:00:00`);

    if (Number.isNaN(dayStart.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayOfWeek = dayStart.getDay();

    const [blocks, matches] = await Promise.all([
      this.blocks.find({
        where: {
          space: { id },
          startAt: LessThan(dayEnd),
          endAt: MoreThan(dayStart),
        },
      }),
      this.matches.find({
        where: {
          space: { id },
          matchDate: query.date,
          status: In([MatchStatus.Planned, MatchStatus.Confirmed]),
        },
      }),
    ]);

    const schedule = (space.schedules ?? []).find((item) => item.dayOfWeek === dayOfWeek);
    if (!schedule) {
      return [];
    }

    const now = new Date();
    const unavailableReason =
      space.status === SpaceStatus.Maintenance
        ? 'Espacio en mantenimiento'
        : space.status === SpaceStatus.Inactive
          ? 'Espacio inactivo'
          : null;

    return eachHour(schedule.openTime, schedule.closeTime).map((slot) => {
      const slotStart = new Date(`${query.date}T${slot.start}`);
      const slotEnd = new Date(`${query.date}T${slot.end}`);
      const startMinute = timeToMinutes(slot.start);
      const endMinute = timeToMinutes(slot.end);

      const block = blocks.find((item) => item.startAt < slotEnd && item.endAt > slotStart);
      const match = matches.find(
        (item) =>
          timeToMinutes(item.startTime) < endMinute && timeToMinutes(item.endTime) > startMinute,
      );

      let reason: string | undefined;
      if (unavailableReason) {
        reason = unavailableReason;
      } else if (slotEnd <= now) {
        reason = 'Horario pasado';
      } else if (block) {
        reason = this.blockReasonLabel(block.reason);
      } else if (match) {
        reason = 'Ocupado';
      }

      return {
        startTime: slot.start,
        endTime: slot.end,
        available: !reason,
        price: space.pricePerHour,
        reason,
      };
    });
  }

  private async resolveSports(allowed: Sport[], sportIds?: number[]): Promise<Sport[]> {
    if (!sportIds?.length) {
      return allowed;
    }

    const unique = [...new Set(sportIds)];
    const allowedIds = new Set(allowed.map((sport) => sport.id));
    if (unique.some((sportId) => !allowedIds.has(sportId))) {
      throw new BadRequestException('El espacio sólo puede ofrecer deportes de la sede');
    }

    const sports = await this.sports.find({ where: { id: In(unique) } });
    if (sports.length !== unique.length) {
      throw new BadRequestException('Uno o más deportes no existen');
    }

    return sports;
  }

  private blockReasonLabel(reason: BlockReason): string {
    switch (reason) {
      case BlockReason.Maintenance:
        return 'Mantenimiento';
      case BlockReason.Closed:
        return 'Cerrado';
      default:
        return 'Bloqueado';
    }
  }

  private toBlockModel(block: Block): SpaceBlock {
    return {
      id: block.id,
      spaceId: block.spaceId,
      startAt: block.startAt.toISOString(),
      endAt: block.endAt.toISOString(),
      reason: block.reason,
      createdAt: block.createdAt.toISOString(),
    };
  }
}
