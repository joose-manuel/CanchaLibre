import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Space } from './space.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Space, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'space_id' })
  space!: Space;

  @Column({ name: 'space_id', type: 'uuid' })
  spaceId!: string;

  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek!: number;

  @Column({ name: 'open_time', type: 'time' })
  openTime!: string;

  @Column({ name: 'close_time', type: 'time' })
  closeTime!: string;
}
