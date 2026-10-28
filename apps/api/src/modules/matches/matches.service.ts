import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, LessThan, MoreThan, Repository } from 'typeorm';
import {
  BookingStatus,
  MatchDetails as MatchDetailsModel,
  MatchFormat,
  MatchPlayerRole,
  MatchPlayerStatus,
  MatchStatus,
  MatchSummary as MatchSummaryModel,
  NotificationType,
  SpaceStatus,
  UserRole,
} from '@canchalibre/shared-domain';
import { timeToMinutes } from '@canchalibre/shared-utils';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { toMatchDetails, toMatchSummary } from '../../common/mappers/api.mapper';
import { NotificationsService } from '../notifications/notifications.service';
import { Block } from '../spaces/entities/block.entity';
import { Schedule } from '../spaces/entities/schedule.entity';
import { Space } from '../spaces/entities/space.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchQueryDto } from './dto/match-query.dto';
import { MatchPlayer } from './entities/match-player.entity';
import { Match } from './entities/match.entity';
import { Booking } from '../bookings/entities/booking.entity';

const LIST_RELATIONS = [
  'space',
  'space.venue',
  'space.venue.city',
  'space.venue.sports',
  'space.sports',
  'sport',
];

const DETAIL_RELATIONS = [
  'space',
  'space.venue',
  'space.venue.city',
  'space.venue.sports',
  'space.venue.owner',
  'space.sports',
  'space.schedules',
  'sport',
  'creator',
  'players',
  'players.user',
];

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    @InjectRepository(MatchPlayer)
    private readonly players: Repository<MatchPlayer>,
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
    @InjectRepository(Space)
    private readonly spaces: Repository<Space>,
    @InjectRepository(Schedule)
    private readonly schedules: Repository<Schedule>,
    @InjectRepository(Block)
    private readonly blocks: Repository<Block>,
    private readonly notifications: NotificationsService,
  ) {}

  async findAll(query: MatchQueryDto): Promise<MatchSummaryModel[]> {
    const qb = this.buildListQuery();

    if (query.status) {
      qb.andWhere('match.status = :status', { status: query.status });
    } else {
      qb.andWhere('match.status <> :cancelled', { cancelled: MatchStatus.Cancelled });
    }

    if (query.cityId) {
      qb.andWhere('city.id = :cityId', { cityId: query.cityId });
    }
    if (query.date) {
      qb.andWhere('match.match_date = :date', { date: query.date });
    }
    if (query.sportId !== undefined) {
      qb.andWhere('match.sport_id = :sportId', { sportId: query.sportId });
    }
    if (query.spaceId) {
      qb.andWhere('match.space_id = :spaceId', { spaceId: query.spaceId });
    }

    qb.orderBy('match.match_date', 'ASC').addOrderBy('match.start_time', 'ASC');
    return this.mapMatches(await qb.getMany());
  }

  async findMine(userId: string): Promise<MatchSummaryModel[]> {
    const qb = this.buildListQuery()
      .where('match.creator_id = :userId', { userId })
      .orWhere(
        'EXISTS (SELECT 1 FROM match_players mp WHERE mp.match_id = match.id AND mp.user_id = :userId)',
        { userId },
      )
      .orderBy('match.match_date', 'DESC')
      .addOrderBy('match.start_time', 'DESC');

    return this.mapMatches(await qb.getMany());
  }

  async findOne(id: string): Promise<MatchDetailsModel> {
    const match = await this.matches.findOne({ where: { id }, relations: DETAIL_RELATIONS });
    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }

    const booking = await this.bookings.findOne({ where: { match: { id } } });
    return toMatchDetails(match, this.countJoined(match.players ?? []), booking);
  }

  async create(dto: CreateMatchDto, user: AuthenticatedUser): Promise<MatchDetailsModel> {
    const space = await this.spaces.findOne({
      where: { id: dto.spaceId },
      relations: ['venue', 'venue.owner', 'venue.sports', 'sports'],
    });

    if (!space) {
      throw new NotFoundException('Espacio no disponible');
    }

    if (space.status !== SpaceStatus.Active) {
      throw new BadRequestException('El espacio no está activo');
    }

    const offered = space.sports?.length ? space.sports : space.venue.sports;
    if (!offered?.some((sport) => sport.id === dto.sportId)) {
      throw new BadRequestException('El deporte no está disponible en este espacio');
    }

    if (dto.capacity > space.capacity) {
      throw new BadRequestException(
        `La capacidad no puede superar la del espacio (${space.capacity})`,
      );
    }

    const startTime = normalizeTime(dto.startTime);
    const endTime = normalizeTime(dto.endTime);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la de fin');
    }

    const date = new Date(`${dto.matchDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }

    const startsAt = new Date(`${dto.matchDate}T${startTime}`);
    if (startsAt <= new Date()) {
      throw new BadRequestException('El partido debe programarse en el futuro');
    }

    const schedule = await this.schedules.findOne({
      where: { space: { id: space.id }, dayOfWeek: date.getDay() },
    });

    if (!schedule) {
      throw new BadRequestException('El espacio no tiene horario configurado para ese día');
    }

    if (
      startMinutes < timeToMinutes(schedule.openTime) ||
      endMinutes > timeToMinutes(schedule.closeTime)
    ) {
      throw new BadRequestException(
        `El horario debe estar entre ${schedule.openTime.slice(0, 5)} y ${schedule.closeTime.slice(0, 5)}`,
      );
    }

    const endsAt = new Date(`${dto.matchDate}T${endTime}`);
    const block = await this.blocks.findOne({
      where: {
        space: { id: space.id },
        startAt: LessThan(endsAt),
        endAt: MoreThan(startsAt),
      },
    });

    if (block) {
      throw new BadRequestException('El horario está bloqueado por la sede');
    }

    const overlapping = await this.matches
      .createQueryBuilder('match')
      .where('match.space_id = :spaceId', { spaceId: space.id })
      .andWhere('match.match_date = :date', { date: dto.matchDate })
      .andWhere('match.status IN (:...statuses)', {
        statuses: [MatchStatus.Planned, MatchStatus.Confirmed],
      })
      .andWhere('match.start_time < :endTime AND match.end_time > :startTime', {
        startTime,
        endTime,
      })
      .getCount();

    if (overlapping > 0) {
      throw new ConflictException('Ya existe un partido en ese horario');
    }

    const durationHours = (endMinutes - startMinutes) / 60;
    const priceTotal = dto.priceTotal ?? Math.round(space.pricePerHour * durationHours);
    const depositPercent = space.venue.depositPercent;

    const saved = await this.matches.manager.transaction(async (manager) => {
      const match = manager.create(Match, {
        space: { id: space.id },
        spaceId: space.id,
        creator: { id: user.id },
        creatorId: user.id,
        sport: { id: dto.sportId },
        sportId: dto.sportId,
        matchDate: dto.matchDate,
        startTime,
        endTime,
        format: dto.format ?? MatchFormat.FiveVFive,
        capacity: dto.capacity,
        priceTotal,
        status: MatchStatus.Planned,
      });
      await manager.save(match);

      await manager.save(
        manager.create(MatchPlayer, {
          match: { id: match.id },
          matchId: match.id,
          user: { id: user.id },
          userId: user.id,
          role: MatchPlayerRole.Organizer,
          status: MatchPlayerStatus.Joined,
        }),
      );

      const code = await this.generateBookingCode(manager);
      await manager.save(
        manager.create(Booking, {
          match: { id: match.id },
          matchId: match.id,
          code,
          status: BookingStatus.Pending,
          depositAmount: Math.round((priceTotal * depositPercent) / 100),
          serviceFee: 0,
        }),
      );

      return match;
    });

    await this.notifications.create(
      space.venue.ownerId,
      NotificationType.Booking,
      'Nueva reserva',
      `${user.fullName} creó un partido en ${space.name} para el ${dto.matchDate}.`,
    );

    return this.findOne(saved.id);
  }

  async join(id: string, user: AuthenticatedUser): Promise<MatchDetailsModel> {
    const match = await this.matches.findOne({ where: { id } });
    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }

    if (match.status !== MatchStatus.Planned && match.status !== MatchStatus.Confirmed) {
      throw new BadRequestException('El partido no admite nuevos jugadores');
    }

    await this.matches.manager.transaction(async (manager) => {
      const current = await manager.findOne(Match, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!current) {
        throw new NotFoundException('Partido no encontrado');
      }

      if (current.status !== MatchStatus.Planned && current.status !== MatchStatus.Confirmed) {
        throw new BadRequestException('El partido no admite nuevos jugadores');
      }

      const existing = await manager.findOne(MatchPlayer, {
        where: { match: { id }, user: { id: user.id } },
      });

      if (existing && existing.status !== MatchPlayerStatus.Cancelled) {
        throw new ConflictException('Ya estás inscrito en este partido');
      }

      const joined = await manager.count(MatchPlayer, {
        where: {
          match: { id },
          status: In([MatchPlayerStatus.Joined, MatchPlayerStatus.Paid]),
        },
      });

      if (joined >= current.capacity) {
        throw new ConflictException('El partido está lleno');
      }

      if (existing) {
        existing.status = MatchPlayerStatus.Joined;
        existing.role = MatchPlayerRole.Player;
        await manager.save(existing);
      } else {
        await manager.save(
          manager.create(MatchPlayer, {
            match: { id },
            matchId: id,
            user: { id: user.id },
            userId: user.id,
            role: MatchPlayerRole.Player,
            status: MatchPlayerStatus.Joined,
          }),
        );
      }

      if (joined + 1 >= current.capacity) {
        current.status = MatchStatus.Confirmed;
        await manager.save(current);

        const booking = await manager.findOne(Booking, { where: { match: { id } } });
        if (booking && booking.status === BookingStatus.Pending) {
          booking.status = BookingStatus.Confirmed;
          await manager.save(booking);
        }
      }
    });

    const full = await this.findBookingMatch(id);
    await this.notifications.create(
      full.creatorId,
      NotificationType.Match,
      'Nuevo jugador',
      `${user.fullName} se unió a tu partido.`,
    );

    return this.findOne(id);
  }

  async leave(id: string, user: AuthenticatedUser): Promise<MatchDetailsModel> {
    const match = await this.matches.findOne({ where: { id } });
    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }

    const player = await this.players.findOne({
      where: { match: { id }, user: { id: user.id } },
    });

    if (!player) {
      throw new NotFoundException('No estás inscrito en este partido');
    }

    if (player.role === MatchPlayerRole.Organizer) {
      throw new ForbiddenException('El organizador no puede abandonar el partido');
    }

    if (player.status !== MatchPlayerStatus.Cancelled) {
      player.status = MatchPlayerStatus.Cancelled;
      await this.players.save(player);
    }

    return this.findOne(id);
  }

  async cancel(id: string, user: AuthenticatedUser): Promise<MatchDetailsModel> {
    const match = await this.matches.findOne({
      where: { id },
      relations: ['players', 'players.user', 'creator'],
    });

    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }

    if (match.creatorId !== user.id && user.role !== UserRole.Admin) {
      throw new ForbiddenException('Solo el organizador puede cancelar el partido');
    }

    if (match.status === MatchStatus.Cancelled) {
      return this.findOne(id);
    }

    await this.matches.manager.transaction(async (manager) => {
      match.status = MatchStatus.Cancelled;
      await manager.save(match);

      const booking = await manager.findOne(Booking, { where: { match: { id } } });
      if (booking) {
        booking.status = BookingStatus.Cancelled;
        await manager.save(booking);
      }

      await manager
        .createQueryBuilder()
        .update(MatchPlayer)
        .set({ status: MatchPlayerStatus.Cancelled })
        .where('match_id = :id', { id })
        .execute();
    });

    await this.notifications.createMany(
      (match.players ?? []).map((player) => player.userId).filter((userId) => userId !== user.id),
      NotificationType.Match,
      'Partido cancelado',
      `El partido del ${match.matchDate} fue cancelado por el organizador.`,
    );

    return this.findOne(id);
  }

  private buildListQuery() {
    return this.matches
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.space', 'space')
      .leftJoinAndSelect('space.venue', 'venue')
      .leftJoinAndSelect('venue.city', 'city')
      .leftJoinAndSelect('venue.sports', 'venueSport')
      .leftJoinAndSelect('space.sports', 'spaceSport')
      .leftJoinAndSelect('match.sport', 'sport');
  }

  private async mapMatches(matches: Match[]): Promise<MatchSummaryModel[]> {
    const counts = await this.joinedCounts(matches.map((match) => match.id));
    return matches.map((match) => toMatchSummary(match, counts.get(match.id) ?? 0));
  }

  private async joinedCounts(ids: string[]): Promise<Map<string, number>> {
    if (!ids.length) {
      return new Map();
    }

    const rows = await this.players
      .createQueryBuilder('player')
      .select('player.match_id', 'matchId')
      .addSelect('COUNT(*)', 'count')
      .where('player.match_id IN (:...ids)', { ids })
      .andWhere('player.status IN (:...statuses)', {
        statuses: [MatchPlayerStatus.Joined, MatchPlayerStatus.Paid],
      })
      .groupBy('player.match_id')
      .getRawMany<{ matchId: string; count: string }>();

    return new Map(rows.map((row) => [row.matchId, Number(row.count)]));
  }

  private countJoined(players: MatchPlayer[]): number {
    return players.filter(
      (player) =>
        player.status === MatchPlayerStatus.Joined || player.status === MatchPlayerStatus.Paid,
    ).length;
  }

  private async findBookingMatch(id: string): Promise<Match> {
    const match = await this.matches.findOne({ where: { id }, relations: ['creator'] });
    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }
    return match;
  }

  private async generateBookingCode(manager: EntityManager): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
      const count = await manager.count(Booking, { where: { code } });
      if (count === 0) {
        return code;
      }
    }

    throw new ConflictException('No fue posible generar el código de reserva');
  }
}
