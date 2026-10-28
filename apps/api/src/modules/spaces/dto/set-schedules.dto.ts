import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class ScheduleInputDto {
  @ApiProperty({ example: 1, minimum: 0, maximum: 6, description: '0 = domingo, 6 = sábado' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '08:00' })
  @Matches(TIME_PATTERN, { message: 'openTime debe tener formato HH:mm' })
  openTime!: string;

  @ApiProperty({ example: '22:00' })
  @Matches(TIME_PATTERN, { message: 'closeTime debe tener formato HH:mm' })
  closeTime!: string;
}

export class SetSchedulesDto {
  @ApiProperty({ type: [ScheduleInputDto] })
  @IsArray()
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => ScheduleInputDto)
  schedules!: ScheduleInputDto[];
}
