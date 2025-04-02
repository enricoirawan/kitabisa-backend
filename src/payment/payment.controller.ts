import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  MidtransNotificationCallbackData,
  TokenPayload,
} from 'src/common/interface';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { PaymentDto } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async doPayment(@CurrentUser() user: TokenPayload, @Body() dto: PaymentDto) {
    return this.paymentService.doPayment(user.userId, dto);
  }

  @Post('notification-callback')
  async paymentNotificationCallback(@Request() request: any) {
    return this.paymentService.handleNotificationCallback(
      request.body as MidtransNotificationCallbackData,
    );
  }
}
