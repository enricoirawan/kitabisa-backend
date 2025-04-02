import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CampaignModule } from './campaign/campaign.module';
import { FileUploadModule } from './common/file-upload/file-upload.module';
import { DonationsModule } from './donations/donations.module';
import { SocketGatewayModule } from './socket-gateway/socket-gateway.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FileUploadModule,
    CommonModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    CampaignModule,
    DonationsModule,
    SocketGatewayModule,
    PaymentModule,
    NotificationModule,
  ],
})
export class AppModule {}
