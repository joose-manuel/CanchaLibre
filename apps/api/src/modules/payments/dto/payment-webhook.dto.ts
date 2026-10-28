import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ example: 'SBX-123456' })
  @IsString()
  @MaxLength(120)
  gatewayRef!: string;

  @ApiProperty({ enum: ['paid', 'failed', 'refunded'] })
  @IsIn(['paid', 'failed', 'refunded'])
  status!: 'paid' | 'failed' | 'refunded';
}
