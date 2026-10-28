import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingStatus } from '@canchalibre/shared-domain';
import { Match } from '../../matches/entities/match.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match!: Match;

  @Column({ name: 'match_id', type: 'uuid', unique: true })
  matchId!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.Pending })
  status!: BookingStatus;

  @Column({ name: 'deposit_amount', type: 'int', default: 0 })
  depositAmount!: number;

  @Column({ name: 'service_fee', type: 'int', default: 0 })
  serviceFee!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
