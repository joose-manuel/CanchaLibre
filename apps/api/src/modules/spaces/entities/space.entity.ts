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
import { SpaceStatus, SpaceType } from '@canchalibre/shared-domain';
import { Sport } from '../../sports/entities/sport.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Schedule } from './schedule.entity';

@Entity('spaces')
export class Space {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue!: Venue;

  @Column({ name: 'venue_id', type: 'uuid' })
  venueId!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'enum', enum: SpaceType, default: SpaceType.Outdoor })
  type!: SpaceType;

  @Column({ name: 'price_per_hour', type: 'int' })
  pricePerHour!: number;

  @Column({ type: 'enum', enum: SpaceStatus, default: SpaceStatus.Active })
  status!: SpaceStatus;

  @ManyToMany(() => Sport)
  @JoinTable({
    name: 'space_sports',
    joinColumn: { name: 'space_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'sport_id', referencedColumnName: 'id' },
  })
  sports!: Sport[];

  @OneToMany(() => Schedule, (schedule) => schedule.space)
  schedules!: Schedule[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
