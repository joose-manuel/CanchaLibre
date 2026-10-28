import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { PaymentMethod } from '@canchalibre/shared-domain';

export class PayDepositDto {
  @ApiProperty({ description: 'UUID de la reserva' })
  @IsUUID('4')
  bookingId!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.Sandbox })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
