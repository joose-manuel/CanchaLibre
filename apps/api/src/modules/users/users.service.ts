import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PlayerLevel, UserRole } from '@canchalibre/shared-domain';
import { City } from '../cities/entities/city.entity';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  cityId?: string;
  role?: UserRole;
  level?: PlayerLevel;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.findByIdOrNull(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByIdOrNull(id: string): Promise<User | null> {
    return this.users.findOne({
      where: { id },
      relations: ['city'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.city', 'city')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.city', 'city')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.users.create({
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      fullName: data.fullName.trim(),
      phone: data.phone ?? null,
      role: data.role ?? UserRole.Player,
      level: data.level ?? PlayerLevel.Intermediate,
      city: data.cityId ? ({ id: data.cityId } as City) : null,
    });

    try {
      const saved = await this.users.save(user);
      return this.findById(saved.id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } }).driverError?.code ===
          '23505'
      ) {
        throw new ConflictException('El correo ya está registrado');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.level !== undefined) user.level = dto.level;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.cityId !== undefined) {
      user.city = dto.cityId ? ({ id: dto.cityId } as City) : null;
    }

    await this.users.save(user);
    return this.findById(id);
  }

  async becomeOwner(id: string): Promise<User> {
    const user = await this.findById(id);
    if (user.role === UserRole.Player) {
      user.role = UserRole.Owner;
      await this.users.save(user);
    }
    return this.findById(id);
  }

  /**
   * Devuelve el usuario al rol de jugador.
   *
   * Es el camino inverso de `becomeOwner`: el usuario puede alternar entre
   * los dos modos tantas veces como necesite.
   */
  async becomePlayer(id: string): Promise<User> {
    const user = await this.findById(id);
    if (user.role === UserRole.Owner) {
      user.role = UserRole.Player;
      await this.users.save(user);
    }
    return this.findById(id);
  }
}
