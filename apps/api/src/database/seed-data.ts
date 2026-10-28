import { DataSource, EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  BalanceMethod,
  BookingStatus,
  MatchFormat,
  MatchPlayerRole,
  MatchPlayerStatus,
  MatchStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  PlayerLevel,
  SpaceStatus,
  SpaceType,
  UserRole,
  VenueStatus,
} from '@canchalibre/shared-domain';
import { addDaysIso, todayIso } from '@canchalibre/shared-utils';
import { City } from '../modules/cities/entities/city.entity';
import { Sport } from '../modules/sports/entities/sport.entity';
import { User } from '../modules/users/entities/user.entity';
import { Venue } from '../modules/venues/entities/venue.entity';
import { Space } from '../modules/spaces/entities/space.entity';
import { Schedule } from '../modules/spaces/entities/schedule.entity';
import { Match } from '../modules/matches/entities/match.entity';
import { MatchPlayer } from '../modules/matches/entities/match-player.entity';
import { Booking } from '../modules/bookings/entities/booking.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';

const DEMO_PASSWORD = 'CanchaLibre123*';

const CITIES = [
  { name: 'Cali', department: 'Valle del Cauca', lat: 3.4516, lng: -76.532 },
  { name: 'Bogotá D.C.', department: 'Cundinamarca', lat: 4.711, lng: -74.0721 },
  { name: 'Medellín', department: 'Antioquia', lat: 6.2442, lng: -75.5812 },
  { name: 'Barranquilla', department: 'Atlántico', lat: 10.9685, lng: -74.7813 },
  { name: 'Cartagena', department: 'Bolívar', lat: 10.391, lng: -75.4794 },
];

const SPORTS = [
  { name: 'Fútbol', iconUrl: null },
  { name: 'Pádel', iconUrl: null },
  { name: 'Básquet', iconUrl: null },
  { name: 'Tenis', iconUrl: null },
  { name: 'Vóleibol', iconUrl: null },
];

export interface SeedResult {
  cities: number;
  sports: number;
  users: number;
  demo: boolean;
}

async function ensureCity(
  repo: Repository<City>,
  seed: { name: string; department: string; lat: number; lng: number },
): Promise<City> {
  const existing = await repo.findOne({ where: { name: seed.name } });
  if (existing) {
    return existing;
  }
  return repo.save(repo.create(seed));
}

async function ensureSport(
  repo: Repository<Sport>,
  seed: { name: string; iconUrl: string | null },
): Promise<Sport> {
  const existing = await repo.findOne({ where: { name: seed.name } });
  if (existing) {
    return existing;
  }
  return repo.save(repo.create(seed));
}

async function ensureUser(
  repo: Repository<User>,
  data: {
    email: string;
    fullName: string;
    role: UserRole;
    level: PlayerLevel;
    city: City;
    passwordHash: string;
  },
): Promise<User> {
  const existing = await repo.findOne({ where: { email: data.email } });
  if (existing) {
    return existing;
  }

  return repo.save(
    repo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      phone: null,
      avatarUrl: null,
      role: data.role,
      level: data.level,
      city: data.city,
      cityId: data.city.id,
    }),
  );
}

async function createSpaceWithSchedule(
  manager: EntityManager,
  data: {
    venue: Venue;
    name: string;
    capacity: number;
    type: SpaceType;
    pricePerHour: number;
    sports: Sport[];
  },
): Promise<Space> {
  const repo = manager.getRepository(Space);
  const scheduleRepo = manager.getRepository(Schedule);

  const space = await repo.save(
    repo.create({
      venue: data.venue,
      venueId: data.venue.id,
      name: data.name,
      capacity: data.capacity,
      type: data.type,
      pricePerHour: data.pricePerHour,
      status: SpaceStatus.Active,
      sports: data.sports,
    }),
  );

  await scheduleRepo.save(
    Array.from({ length: 7 }, (_, dayOfWeek) =>
      scheduleRepo.create({
        space,
        spaceId: space.id,
        dayOfWeek,
        openTime: '07:00:00',
        closeTime: '23:00:00',
      }),
    ),
  );

  return space;
}

async function createDemoMatch(
  manager: EntityManager,
  data: {
    space: Space;
    creator: User;
    sport: Sport;
    date: string;
    startTime: string;
    endTime: string;
    format: MatchFormat;
    capacity: number;
    priceTotal: number;
    paid: boolean;
    extraPlayers: User[];
  },
): Promise<void> {
  const matchRepo = manager.getRepository(Match);
  const playerRepo = manager.getRepository(MatchPlayer);
  const bookingRepo = manager.getRepository(Booking);
  const paymentRepo = manager.getRepository(Payment);

  const duplicate = await matchRepo.findOne({
    where: {
      space: { id: data.space.id },
      matchDate: data.date,
      startTime: data.startTime,
    },
  });
  if (duplicate) {
    return;
  }

  const match = await matchRepo.save(
    matchRepo.create({
      space: data.space,
      spaceId: data.space.id,
      creator: data.creator,
      creatorId: data.creator.id,
      sport: data.sport,
      sportId: data.sport.id,
      matchDate: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      format: data.format,
      capacity: data.capacity,
      priceTotal: data.priceTotal,
      status: MatchStatus.Planned,
    }),
  );

  const players = [
    {
      user: data.creator,
      role: MatchPlayerRole.Organizer,
      status: data.paid ? MatchPlayerStatus.Paid : MatchPlayerStatus.Joined,
    },
    ...data.extraPlayers.map((user) => ({
      user,
      role: MatchPlayerRole.Player,
      status: data.paid ? MatchPlayerStatus.Paid : MatchPlayerStatus.Joined,
    })),
  ];

  await playerRepo.save(
    players.map((item) =>
      playerRepo.create({
        match,
        matchId: match.id,
        user: item.user,
        userId: item.user.id,
        role: item.role,
        status: item.status,
      }),
    ),
  );

  const depositAmount = Math.round((data.priceTotal * data.space.venue.depositPercent) / 100);
  const booking = await bookingRepo.save(
    bookingRepo.create({
      match,
      matchId: match.id,
      code: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      status: data.paid ? BookingStatus.Paid : BookingStatus.Pending,
      depositAmount,
      serviceFee: 0,
    }),
  );

  if (data.paid) {
    await paymentRepo.save(
      paymentRepo.create({
        booking,
        bookingId: booking.id,
        user: data.creator,
        userId: data.creator.id,
        amount: depositAmount,
        type: PaymentType.Deposit,
        method: PaymentMethod.Sandbox,
        status: PaymentStatus.Paid,
        gatewayRef: `SBX-SEED-${booking.code}`,
        paidAt: new Date(),
      }),
    );
  }
}

async function seedDemo(
  manager: EntityManager,
  cities: Map<string, City>,
  sports: Map<string, Sport>,
): Promise<void> {
  const venueRepo = manager.getRepository(Venue);
  const userRepo = manager.getRepository(User);
  const notificationRepo = manager.getRepository(Notification);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const cali = cities.get('Cali');
  const futbol = sports.get('Fútbol');
  const padel = sports.get('Pádel');

  if (!cali || !futbol || !padel) {
    return;
  }

  const owner = await ensureUser(userRepo, {
    email: 'owner@canchalibre.co',
    fullName: 'Mauricio Propietario',
    role: UserRole.Owner,
    level: PlayerLevel.Pro,
    city: cali,
    passwordHash,
  });

  const player = await ensureUser(userRepo, {
    email: 'player@canchalibre.co',
    fullName: 'Ana María Jugadora',
    role: UserRole.Player,
    level: PlayerLevel.Intermediate,
    city: cali,
    passwordHash,
  });

  const carlos = await ensureUser(userRepo, {
    email: 'carlos@canchalibre.co',
    fullName: 'Carlos Delantero',
    role: UserRole.Player,
    level: PlayerLevel.SemiPro,
    city: cali,
    passwordHash,
  });

  const existing = await venueRepo.findOne({
    where: { name: 'La Sultana Fútbol Club' },
  });
  if (existing) {
    return;
  }

  const venue = await venueRepo.save(
    venueRepo.create({
      owner,
      ownerId: owner.id,
      city: cali,
      cityId: cali.id,
      name: 'La Sultana Fútbol Club',
      address: 'Calle 9 # 50-20, Cali',
      phone: '+57 300 555 0101',
      lat: 3.3978,
      lng: -76.5465,
      depositPercent: 30,
      cancelWindowHours: 24,
      balanceMethod: BalanceMethod.Venue,
      status: VenueStatus.Active,
      coverUrl: null,
      sports: [futbol, padel],
    }),
  );

  const field1 = await createSpaceWithSchedule(manager, {
    venue,
    name: 'Cancha 1',
    capacity: 10,
    type: SpaceType.Outdoor,
    pricePerHour: 80000,
    sports: [futbol],
  });

  const field2 = await createSpaceWithSchedule(manager, {
    venue,
    name: 'Cancha 2',
    capacity: 14,
    type: SpaceType.Indoor,
    pricePerHour: 120000,
    sports: [futbol],
  });

  const padelCourt = await createSpaceWithSchedule(manager, {
    venue,
    name: 'Pádel Cristal',
    capacity: 4,
    type: SpaceType.Indoor,
    pricePerHour: 60000,
    sports: [padel],
  });

  const today = todayIso();
  const tomorrow = addDaysIso(today, 1);

  await createDemoMatch(manager, {
    space: field1,
    creator: player,
    sport: futbol,
    date: today,
    startTime: '18:00:00',
    endTime: '20:00:00',
    format: MatchFormat.FiveVFive,
    capacity: 10,
    priceTotal: 160000,
    paid: true,
    extraPlayers: [carlos],
  });

  await createDemoMatch(manager, {
    space: field2,
    creator: player,
    sport: futbol,
    date: tomorrow,
    startTime: '19:00:00',
    endTime: '21:00:00',
    format: MatchFormat.SevenVSeven,
    capacity: 14,
    priceTotal: 240000,
    paid: false,
    extraPlayers: [],
  });

  await createDemoMatch(manager, {
    space: padelCourt,
    creator: carlos,
    sport: padel,
    date: tomorrow,
    startTime: '20:00:00',
    endTime: '22:00:00',
    format: MatchFormat.Other,
    capacity: 4,
    priceTotal: 120000,
    paid: false,
    extraPlayers: [player],
  });

  const secondVenue = await venueRepo.findOne({ where: { name: 'Canchas El Peñón' } });
  if (!secondVenue) {
    const venue2 = await venueRepo.save(
      venueRepo.create({
        owner,
        ownerId: owner.id,
        city: cali,
        cityId: cali.id,
        name: 'Canchas El Peñón',
        address: 'Carrera 39 # 5-80, Cali',
        phone: '+57 300 555 0202',
        lat: 3.4285,
        lng: -76.5402,
        depositPercent: 25,
        cancelWindowHours: 12,
        balanceMethod: BalanceMethod.App,
        status: VenueStatus.Active,
        coverUrl: null,
        sports: [futbol],
      }),
    );

    await createSpaceWithSchedule(manager, {
      venue: venue2,
      name: 'Cancha Principal',
      capacity: 12,
      type: SpaceType.Outdoor,
      pricePerHour: 70000,
      sports: [futbol],
    });
  }

  const existingNotification = await notificationRepo.findOne({
    where: { user: { id: player.id }, type: NotificationType.Booking },
  });
  if (!existingNotification) {
    await notificationRepo.save(
      notificationRepo.create({
        user: player,
        userId: player.id,
        type: NotificationType.Booking,
        title: 'Reserva pagada',
        body: 'Tu anticipo fue confirmado. Presenta el QR en la sede.',
        readAt: null,
      }),
    );
  }
}

export async function runSeed(dataSource: DataSource, demo: boolean): Promise<SeedResult> {
  return dataSource.transaction(async (manager) => {
    const cityRepo = manager.getRepository(City);
    const sportRepo = manager.getRepository(Sport);

    const cities = new Map<string, City>();
    for (const item of CITIES) {
      cities.set(item.name, await ensureCity(cityRepo, item));
    }

    const sports = new Map<string, Sport>();
    for (const item of SPORTS) {
      sports.set(item.name, await ensureSport(sportRepo, item));
    }

    if (demo) {
      await seedDemo(manager, cities, sports);
    }

    return {
      cities: cities.size,
      sports: sports.size,
      users: demo ? 3 : 0,
      demo,
    };
  });
}

export const DEMO_CREDENTIALS = {
  owner: { email: 'owner@canchalibre.co', password: DEMO_PASSWORD },
  player: { email: 'player@canchalibre.co', password: DEMO_PASSWORD },
};
