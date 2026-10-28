import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MatchFormat, MatchStatus } from '@canchalibre/shared-domain';
import { Sport } from '../../sports/entities/sport.entity';
import { Space } from '../../spaces/entities/space.entity';
import { User } from '../../users/entities/user.entity';
import { MatchPlayer } from './match-player.entity';

@Entity('matches')
@Index('idx_matches_date', ['matchDate'])
@Index('idx_matches_space_date', ['space', 'matchDate'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Space, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'space_id' })
  space!: Space;

  @Column({ name: 'space_id', type: 'uuid' })
  spaceId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator!: User;

  @Column({ name: 'creator_id', type: 'uuid' })
  creatorId!: string;

  @ManyToOne(() => Sport, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'sport_id' })
  sport!: Sport;

  @Column({ name: 'sport_id', type: 'int' })
  sportId!: number;

  @Column({ name: 'match_date', type: 'date' })
  matchDate!: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ type: 'enum', enum: MatchFormat, default: MatchFormat.FiveVFive })
  format!: MatchFormat;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ name: 'price_total', type: 'int' })
  priceTotal!: number;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.Planned })
  status!: MatchStatus;

  @OneToMany(() => MatchPlayer, (player) => player.match)
  players!: MatchPlayer[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
