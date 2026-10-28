import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601 } from 'class-validator';
import { BlockReason } from '@canchalibre/shared-domain';

export class CreateBlockDto {
  @ApiProperty({ example: '2026-11-02T08:00:00.000Z' })
  @IsISO8601()
  startAt!: string;

  @ApiProperty({ example: '2026-11-02T12:00:00.000Z' })
  @IsISO8601()
  endAt!: string;

  @ApiProperty({ enum: BlockReason, example: BlockReason.Maintenance })
  @IsEnum(BlockReason)
  reason!: BlockReason;
}
