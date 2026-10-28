import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BalanceMethod, VenueStatus } from '@canchalibre/shared-domain';
import { City } from '../../cities/entities/city.entity';
import { User } from '../../users/entities/user.entity';
import { Sport } from '../../sports/entities/sport.entity';
import { Space } from '../../spaces/entities/space.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => City, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'city_id' })
  city!: City;

  @Column({ name: 'city_id', type: 'uuid' })
  cityId!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 250 })
  address!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @Column({ type: 'double precision' })
  lat!: number;

  @Column({ type: 'double precision' })
  lng!: number;

  @Column({ name: 'deposit_percent', type: 'int', default: 30 })
  depositPercent!: number;

  @Column({ name: 'cancel_window_hours', type: 'int', default: 24 })
  cancelWindowHours!: number;

  @Column({
    name: 'balance_method',
    type: 'enum',
    enum: BalanceMethod,
    default: BalanceMethod.Venue,
  })
  balanceMethod!: BalanceMethod;

  @Column({ type: 'enum', enum: VenueStatus, default: VenueStatus.Active })
  status!: VenueStatus;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl!: string | null;

  @ManyToMany(() => Sport)
  @JoinTable({
    name: 'venue_sports',
    joinColumn: { name: 'venue_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'sport_id', referencedColumnName: 'id' },
  })
  sports!: Sport[];

  @OneToMany(() => Space, (space) => space.venue)
  spaces!: Space[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
