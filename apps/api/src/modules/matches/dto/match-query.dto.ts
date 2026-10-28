import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Matches } from 'class-validator';
import { MatchStatus } from '@canchalibre/shared-domain';

export class MatchQueryDto {
  @ApiPropertyOptional({ description: 'UUID de la ciudad' })
  @IsOptional()
  @IsUUID('4')
  cityId?: string;

  @ApiPropertyOptional({ example: '2026-11-02' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date debe tener formato YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sportId?: number;

  @ApiPropertyOptional({ enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ description: 'UUID del espacio' })
  @IsOptional()
  @IsUUID('4')
  spaceId?: string;
}
