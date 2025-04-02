import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { DonationsModule } from 'src/donations/donations.module';
import { CampaignModule } from 'src/campaign/campaign.module';
import { NotificationModule } from 'src/notification/notification.module';
import { SocketGatewayModule } from 'src/socket-gateway/socket-gateway.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    DonationsModule,
    CampaignModule,
    NotificationModule,
    SocketGatewayModule,
  ],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
