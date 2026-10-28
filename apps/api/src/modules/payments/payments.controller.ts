import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Payment as PaymentModel } from '@canchalibre/shared-domain';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PayDepositDto } from './dto/pay-deposit.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @ApiBearerAuth()
  @Get('mine')
  findMine(@CurrentUser('id') userId: string): Promise<PaymentModel[]> {
    return this.payments.findMine(userId);
  }

  @ApiBearerAuth()
  @Post('deposit')
  @HttpCode(HttpStatus.CREATED)
  payDeposit(
    @Body() dto: PayDepositDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaymentModel> {
    return this.payments.payDeposit(dto, user);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({ name: 'x-webhook-secret', required: true })
  webhook(
    @Body() dto: PaymentWebhookDto,
    @Headers('x-webhook-secret') secret: string | undefined,
  ): Promise<PaymentModel> {
    return this.payments.webhook(dto, secret);
  }
}
