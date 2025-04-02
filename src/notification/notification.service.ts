import { BadGatewayException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { formatDonationMessage } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotificationByUserId(userId: number) {
    try {
      return await this.prisma.notification.findMany({
        where: {
          userId: userId,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: {
            include: {
              Donation: {
                select: {
                  user: {
                    select: {
                      photoProfileUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async updateNotificationReadStatus(notificationId: number, userId: number) {
    try {
      return await this.prisma.notification.update({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isAlreadyRead: true,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async bulkUpdateNotificationReadStatus(userId: number) {
    try {
      return await this.prisma.notification.updateMany({
        where: {
          userId: userId,
          isAlreadyRead: false,
        },
        data: {
          isAlreadyRead: true,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async createNotificationUsingTransaction(
    trx: Prisma.TransactionClient,
    user: Prisma.UserCreateManyInput,
    payment: Prisma.PaymentCreateManyInput,
    campaign: Prisma.CampaignCreateManyInput,
  ) {
    try {
      return await trx.notification.create({
        data: {
          message: `${formatDonationMessage(user.username, payment.nominal)}`,
          userId: campaign.user_id,
          campaignId: campaign.id,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
}
