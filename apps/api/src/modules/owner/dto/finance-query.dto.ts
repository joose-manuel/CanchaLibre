import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { FinancePeriod } from '@canchalibre/shared-domain';

export class FinanceQueryDto {
  @ApiProperty({ enum: ['day', 'week', 'month'], example: 'month' })
  @IsIn(['day', 'week', 'month'])
  period!: FinancePeriod;

  @ApiPropertyOptional({ description: 'UUID de la sede para filtrar' })
  @IsOptional()
  @IsUUID('4')
  venueId?: string;
}
