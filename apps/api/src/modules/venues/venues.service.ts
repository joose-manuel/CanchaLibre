import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BalanceMethod,
  UserRole,
  VenueDetails as VenueDetailsModel,
  VenueStatus,
  VenueSummary as VenueSummaryModel,
} from '@canchalibre/shared-domain';
import { haversineKm } from '@canchalibre/shared-utils';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { toVenueDetails, toVenueSummary } from '../../common/mappers/api.mapper';
import { CitiesService } from '../cities/cities.service';
import { SportsService } from '../sports/sports.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenuePoliciesDto } from './dto/venue-policies.dto';
import { VenueQueryDto } from './dto/venue-query.dto';
import { Venue } from './entities/venue.entity';

const DETAIL_RELATIONS = [
  'owner',
  'city',
  'sports',
  'spaces',
  'spaces.sports',
  'spaces.schedules',
];

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venues: Repository<Venue>,
    private readonly cities: CitiesService,
    private readonly sports: SportsService,
    private readonly users: UsersService,
  ) {}

  async findAll(query: VenueQueryDto): Promise<VenueSummaryModel[]> {
    const qb = this.venues
      .createQueryBuilder('venue')
      .leftJoinAndSelect('venue.city', 'city')
      .leftJoinAndSelect('venue.sports', 'sport')
      .leftJoinAndSelect('venue.spaces', 'space')
      .where('venue.status = :status', { status: VenueStatus.Active });

    if (query.cityId) {
      qb.andWhere('venue.city_id = :cityId', { cityId: query.cityId });
    }

    if (query.sportId !== undefined) {
      qb.andWhere('sport.id = :sportId', { sportId: query.sportId });
    }

    if (query.q?.trim()) {
      qb.andWhere('(LOWER(venue.name) LIKE :q OR LOWER(venue.address) LIKE :q)', {
        q: `%${query.q.trim().toLowerCase()}%`,
      });
    }

    const hasCoords = query.lat !== undefined && query.lng !== undefined;
    const results = await qb.getMany();

    const summaries = results.map((venue) =>
      toVenueSummary(
        venue,
        hasCoords ? haversineKm(query.lat as number, query.lng as number, venue.lat, venue.lng) : undefined,
      ),
    );

    if (hasCoords) {
      summaries.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    } else {
      summaries.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }

    return summaries;
  }

  async findOne(id: string, user?: AuthenticatedUser): Promise<VenueDetailsModel> {
    const venue = await this.venues.findOne({ where: { id }, relations: DETAIL_RELATIONS });

    if (!venue) {
      throw new NotFoundException('Sede no encontrada');
    }

    const isOwner = user?.id === venue.ownerId || user?.role === UserRole.Admin;
    if (venue.status !== VenueStatus.Active && !isOwner) {
      throw new NotFoundException('Sede no encontrada');
    }

    return toVenueDetails(venue);
  }

  async findMine(user: AuthenticatedUser): Promise<VenueSummaryModel[]> {
    const venues = await this.venues.find({
      where: { owner: { id: user.id } },
      relations: ['city', 'sports', 'spaces'],
      order: { name: 'ASC' },
    });

    return venues.map((venue) => toVenueSummary(venue));
  }

  async findEntity(id: string): Promise<Venue> {
    const venue = await this.venues.findOne({
      where: { id },
      relations: ['owner', 'city', 'sports', 'spaces', 'spaces.sports', 'spaces.schedules'],
    });

    if (!venue) {
      throw new NotFoundException('Sede no encontrada');
    }

    return venue;
  }

  async create(dto: CreateVenueDto, user: AuthenticatedUser): Promise<VenueDetailsModel> {
    const city = await this.cities.findOne(dto.cityId);
    const sportIds = [...new Set(dto.sportIds)];
    const sports = await this.sports.findByIds(sportIds);

    if (sports.length !== sportIds.length) {
      throw new BadRequestException('Uno o más deportes no existen');
    }

    const venue = this.venues.create({
      name: dto.name.trim(),
      address: dto.address.trim(),
      phone: dto.phone?.trim() ?? null,
      lat: dto.lat,
      lng: dto.lng,
      depositPercent: dto.depositPercent,
      cancelWindowHours: dto.cancelWindowHours,
      balanceMethod: dto.balanceMethod ?? BalanceMethod.Venue,
      coverUrl: dto.coverUrl ?? null,
      status: VenueStatus.Active,
      city,
      cityId: city.id,
      owner: { id: user.id } as User,
      ownerId: user.id,
      sports,
    });

    const saved = await this.venues.save(venue);
    await this.users.becomeOwner(user.id);

    return this.findOne(saved.id, { ...user, role: UserRole.Owner });
  }

  async update(
    id: string,
    dto: UpdateVenueDto,
    user: AuthenticatedUser,
  ): Promise<VenueDetailsModel> {
    const venue = await this.assertOwner(id, user);

    if (dto.cityId !== undefined) {
      venue.city = await this.cities.findOne(dto.cityId);
    }

    if (dto.sportIds !== undefined) {
      const sportIds = [...new Set(dto.sportIds)];
      const sports = await this.sports.findByIds(sportIds);
      if (sports.length !== sportIds.length) {
        throw new BadRequestException('Uno o más deportes no existen');
      }
      venue.sports = sports;
    }

    if (dto.name !== undefined) venue.name = dto.name.trim();
    if (dto.address !== undefined) venue.address = dto.address.trim();
    if (dto.phone !== undefined) venue.phone = dto.phone?.trim() ?? null;
    if (dto.lat !== undefined) venue.lat = dto.lat;
    if (dto.lng !== undefined) venue.lng = dto.lng;
    if (dto.depositPercent !== undefined) venue.depositPercent = dto.depositPercent;
    if (dto.cancelWindowHours !== undefined) venue.cancelWindowHours = dto.cancelWindowHours;
    if (dto.balanceMethod !== undefined) venue.balanceMethod = dto.balanceMethod;
    if (dto.coverUrl !== undefined) venue.coverUrl = dto.coverUrl ?? null;

    await this.venues.save(venue);
    return this.findOne(id, user);
  }

  async updatePolicies(
    id: string,
    dto: VenuePoliciesDto,
    user: AuthenticatedUser,
  ): Promise<VenueDetailsModel> {
    const venue = await this.assertOwner(id, user);
    venue.depositPercent = dto.depositPercent;
    venue.cancelWindowHours = dto.cancelWindowHours;
    venue.balanceMethod = dto.balanceMethod;
    await this.venues.save(venue);
    return this.findOne(id, user);
  }

  async assertOwner(venueId: string, user: AuthenticatedUser): Promise<Venue> {
    const venue = await this.venues.findOne({
      where: { id: venueId },
      relations: ['city', 'sports', 'spaces', 'spaces.sports', 'spaces.schedules'],
    });

    if (!venue) {
      throw new NotFoundException('Sede no encontrada');
    }

    if (venue.ownerId !== user.id && user.role !== UserRole.Admin) {
      throw new ForbiddenException('No tienes permisos sobre esta sede');
    }

    return venue;
  }

  async ownsVenue(venueId: string, userId: string): Promise<boolean> {
    return this.venues.exists({ where: { id: venueId, owner: { id: userId } } });
  }
}
