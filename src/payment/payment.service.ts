import {
  BadGatewayException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus, Prisma } from '@prisma/client';
import * as midtransClient from 'midtrans-client';
import { CampaignService } from 'src/campaign/campaign.service';
import { MidtransNotificationCallbackData } from 'src/common/interface';
import { generateOrderId, hashSHA512 } from 'src/common/utils';
import { DonationsService } from 'src/donations/donations.service';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { PaymentDto } from './dto/payment.dto';
import { SocketGateway } from 'src/socket-gateway/socket-gateway';

@Injectable()
export class PaymentService implements OnModuleInit {
  private snap: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly donationsService: DonationsService,
    private readonly campaignService: CampaignService,
    private readonly notificationService: NotificationService,
    private readonly socketGateway: SocketGateway,
  ) {}

  onModuleInit() {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY');
    const isProduction = this.configService.get<string>(
      'MIDTRANS_IS_PRODUCTION',
    );

    this.snap = new midtransClient.Snap({
      isProduction: isProduction === 'false' ? false : true,
      serverKey: serverKey,
      clientKey: clientKey,
    });
  }

  async doPayment(userId: number, dto: PaymentDto) {
    try {
      const successFrontEndPage = this.configService.get<string>(
        'MIDTRANS_SUCCESS_CALLBACK_FRONTEND',
      );
      const errorFrontEndPage = this.configService.get<string>(
        'MIDTRANS_ERROR_CALLBACK_FRONTEND',
      );

      const orderId = generateOrderId(userId);
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: dto.nominal,
        },
        callbacks: {
          finish: `${successFrontEndPage}?nominal=${dto.nominal}&slug=${dto.slug}`,
          error: errorFrontEndPage,
        },
      };

      const result = await this.snap.createTransaction(parameter);
      if (result.token) {
        return await this.prisma.payment.create({
          data: {
            orderId: parameter.transaction_details.order_id,
            nominal: parameter.transaction_details.gross_amount,
            redirectURL: result.redirect_url,
            paymentStatus: PaymentStatus.PENDING,
            userId: userId,
            campaignId: dto.campaignId,
            messageText: dto.message,
          },
        });
      }
    } catch (error) {
      if (error.ApiResponse) {
        const errorMessages = error.ApiResponse.error_messages[0];
        throw new BadGatewayException(errorMessages);
      }
      throw new BadGatewayException(error);
    }
  }

  async handleNotificationCallback(
    midtransData: MidtransNotificationCallbackData,
  ) {
    try {
      //Handle transaction_status success dan expire
      const callbackSignatureKey = midtransData.signature_key;
      const orderId = midtransData.order_id;
      const statusCode = midtransData.status_code;
      const nominal = midtransData.gross_amount;
      const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
      const signatureKey = hashSHA512(
        `${orderId}${statusCode}${nominal}${serverKey}`,
      );

      if (callbackSignatureKey !== signatureKey) {
        throw new UnauthorizedException('Credential Midtrans tidak sah');
      }

      const transactionStatus = midtransData.transaction_status;
      if (transactionStatus === 'expire') {
        this.prisma.$transaction(async (trx: Prisma.TransactionClient) => {
          const payment = await this.findPayment(trx, orderId);

          if (payment.paymentStatus === 'EXPIRE') {
            return;
          }

          await this.updatePayment(
            trx,
            payment.id,
            payment.orderId,
            PaymentStatus.EXPIRE,
          );
        });
      }

      if (
        transactionStatus === 'settlement' ||
        transactionStatus === 'captured'
      ) {
        const result = await this.prisma.$transaction(async (trx) => {
          const payment = await this.findPayment(trx, orderId);

          if (payment.paymentStatus === 'SUCCESS') {
            return;
          }

          await this.updatePayment(
            trx,
            payment.id,
            payment.orderId,
            PaymentStatus.SUCCESS,
          );

          const user = await this.usersService.getUserUsingTransaction(
            trx,
            payment.userId,
          );

          const donation =
            await this.donationsService.createDonationUsingTransaction(
              trx,
              payment,
              user,
            );

          const campaign =
            await this.campaignService.findCampaignUsingTransaction(
              trx,
              payment,
            );

          await this.campaignService.updateCampaignUsingTransaction(
            trx,
            payment,
          );

          const notification =
            await this.notificationService.createNotificationUsingTransaction(
              trx,
              user,
              payment,
              campaign,
            );

          return { donation, notification, campaign };
        });

        if (result.donation && result.notification && result.campaign) {
          this.socketGateway.sendNotification({
            campaignSlug: result.campaign.slug,
            nominal: result.donation.nominal,
            userId: result.campaign.user_id,
            message: result.notification.message,
          });
        }
      }
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async findPayment(trx: Prisma.TransactionClient, orderId: string) {
    return await trx.payment.findFirst({
      where: {
        orderId: orderId,
      },
    });
  }

  async updatePayment(
    trx: Prisma.TransactionClient,
    paymentId: number,
    orderId: string,
    paymentStatus: PaymentStatus,
  ) {
    await trx.payment.update({
      where: {
        id: paymentId,
        orderId: orderId,
      },
      data: {
        paymentStatus: paymentStatus,
      },
    });
  }
}
