import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { MatchFormat } from '@canchalibre/shared-domain';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class CreateMatchDto {
  @ApiProperty({ description: 'UUID del espacio reservable' })
  @IsUUID('4')
  spaceId!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  sportId!: number;

  @ApiProperty({ example: '2026-11-02' })
  @Matches(DATE_PATTERN, { message: 'matchDate debe tener formato YYYY-MM-DD' })
  matchDate!: string;

  @ApiProperty({ example: '18:00' })
  @Matches(TIME_PATTERN, { message: 'startTime debe tener formato HH:mm' })
  startTime!: string;

  @ApiProperty({ example: '20:00' })
  @Matches(TIME_PATTERN, { message: 'endTime debe tener formato HH:mm' })
  endTime!: string;

  @ApiProperty({ enum: MatchFormat, example: MatchFormat.FiveVFive })
  @IsEnum(MatchFormat)
  format!: MatchFormat;

  @ApiProperty({ example: 10, minimum: 2, maximum: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(50)
  capacity!: number;

  @ApiPropertyOptional({
    example: 160000,
    description: 'Si se omite se calcula con la tarifa por hora del espacio',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  priceTotal?: number;
}
