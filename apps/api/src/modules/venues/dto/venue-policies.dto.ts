import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { BalanceMethod } from '@canchalibre/shared-domain';

export class VenuePoliciesDto {
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
}
