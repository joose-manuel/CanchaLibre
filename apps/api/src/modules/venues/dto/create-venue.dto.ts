import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { BalanceMethod } from '@canchalibre/shared-domain';

export class CreateVenueDto {
  @ApiProperty({ example: 'La Sultana Fútbol Club' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: 'Calle 9 # 50-20, Cali' })
  @IsString()
  @MinLength(5)
  @MaxLength(250)
  address!: string;

  @ApiProperty({ description: 'UUID de la ciudad' })
  @IsUUID('4')
  cityId!: string;

  @ApiPropertyOptional({ example: '+57 300 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ example: 3.4516 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: -76.532 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @ApiProperty({ example: 30, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  depositPercent!: number;

  @ApiProperty({ example: 24, minimum: 0, maximum: 720 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(720)
  cancelWindowHours!: number;

  @ApiProperty({ enum: BalanceMethod })
  @IsEnum(BalanceMethod)
  balanceMethod!: BalanceMethod;

  @ApiProperty({ type: [Number], example: [1] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  sportIds!: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  coverUrl?: string;
}
