import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthResponse, PlayerLevel, User as UserModel, UserRole } from '@canchalibre/shared-domain';
import { toUserModel } from '../../common/mappers/api.mapper';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone,
      cityId: dto.cityId,
      role: UserRole.Player,
      level: PlayerLevel.Intermediate,
    });

    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmailWithPassword(dto.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const freshUser = await this.users.findById(user.id);
    return this.buildResponse(freshUser);
  }

  async me(userId: string): Promise<UserModel> {
    return toUserModel(await this.users.findById(userId));
  }

  private async buildResponse(user: User): Promise<AuthResponse> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.config.get<string>('jwt.expiresIn') ?? '7d' } as JwtSignOptions,
    );
    return { accessToken, user: toUserModel(user) };
  }
}
