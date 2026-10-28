import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlockReason } from '@canchalibre/shared-domain';
import { Space } from './space.entity';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Space, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'space_id' })
  space!: Space;

  @Column({ name: 'space_id', type: 'uuid' })
  spaceId!: string;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt!: Date;

  @Column({ type: 'enum', enum: BlockReason, default: BlockReason.Manual })
  reason!: BlockReason;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
