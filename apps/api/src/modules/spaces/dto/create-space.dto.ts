import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { SpaceType } from '@canchalibre/shared-domain';

export class CreateSpaceDto {
  @ApiProperty({ example: 'Cancha 1' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  capacity!: number;

  @ApiProperty({ enum: SpaceType, example: SpaceType.Outdoor })
  @IsEnum(SpaceType)
  type!: SpaceType;

  @ApiProperty({ example: 80000, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50_000_000)
  pricePerHour!: number;

  @ApiPropertyOptional({
    type: [Number],
    example: [1],
    description: 'Si se omite, hereda los deportes de la sede',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  sportIds?: number[];
}
