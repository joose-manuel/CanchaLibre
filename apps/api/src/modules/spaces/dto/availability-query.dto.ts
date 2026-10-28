import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class AvailabilityQueryDto {
  @ApiProperty({ example: '2026-11-02', description: 'Fecha en formato YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date debe tener formato YYYY-MM-DD' })
  date!: string;
}
