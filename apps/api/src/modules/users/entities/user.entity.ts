import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerLevel, UserRole } from '@canchalibre/shared-domain';
import { City } from '../../cities/entities/city.entity';

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 180 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Player })
  role!: UserRole;

  @Column({ type: 'enum', enum: PlayerLevel, default: PlayerLevel.Intermediate })
  level!: PlayerLevel;

  @ManyToOne(() => City, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'city_id' })
  city!: City | null;

  @Column({ name: 'city_id', type: 'uuid', nullable: true })
  cityId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
