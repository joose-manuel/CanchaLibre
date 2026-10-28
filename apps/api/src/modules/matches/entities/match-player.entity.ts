import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MatchPlayerRole, MatchPlayerStatus } from '@canchalibre/shared-domain';
import { User } from '../../users/entities/user.entity';
import { Match } from './match.entity';

@Entity('match_players')
@Index('idx_match_players_unique', ['match', 'user'], { unique: true })
export class MatchPlayer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match!: Match;

  @Column({ name: 'match_id', type: 'uuid' })
  matchId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: MatchPlayerRole, default: MatchPlayerRole.Player })
  role!: MatchPlayerRole;

  @Column({ type: 'enum', enum: MatchPlayerStatus, default: MatchPlayerStatus.Joined })
  status!: MatchPlayerStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
