import { BadGatewayException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignDonations(campaignSlug: string) {
    try {
      return await this.prisma.donation.findMany({
        where: {
          campaign: {
            slug: campaignSlug,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              photoProfileUrl: true,
            },
          },
          campaign: {
            select: {
              headline: true,
              slug: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getNewestDonations() {
    try {
      return this.prisma.donation.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
              photoProfileUrl: true,
            },
          },
          campaign: {
            select: {
              headline: true,
              slug: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getUserDonations(userId: number) {
    try {
      const [donations, userDonationsCount] = await this.prisma.$transaction([
        this.prisma.donation.findMany({
          where: {
            userId,
          },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                username: true,
                photoProfileUrl: true,
              },
            },
            campaign: {
              select: {
                headline: true,
              },
            },
          },
        }),

        this.prisma.donation.count({
          where: { userId },
        }),
      ]);

      return {
        donationsCount: userDonationsCount,
        donations,
      };
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async createDonationUsingTransaction(
    trx: Prisma.TransactionClient,
    payment: Prisma.PaymentCreateManyInput,
    user: Prisma.UserCreateManyInput,
  ) {
    try {
      return await trx.donation.create({
        data: {
          message: payment.messageText,
          nominal: payment.nominal,
          campaignId: payment.campaignId,
          paymentId: payment.id,
          userId: user.id,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
}
