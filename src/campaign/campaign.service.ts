import { BadGatewayException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CloudinaryImageUploadService } from 'src/common/file-upload/cloudinary-image-upload.service';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Prisma } from '@prisma/client';
import { PaginationDto } from './dto/pagination.dto';
import slugify from 'slugify';

@Injectable()
export class CampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryImageUploadService: CloudinaryImageUploadService,
  ) {}

  async createCampaign(
    dto: CreateCampaignDto,
    banner: Express.Multer.File,
    userId: number,
  ) {
    try {
      const bannerImageurl =
        await this.cloudinaryImageUploadService.upload(banner);

      const slug = slugify(dto.headline, {
        lower: true, // Mengubah semua huruf menjadi kecil
        strict: true, // Menghapus karakter khusus (tanda baca, simbol, dll.)
      });

      return this.prisma.campaign.create({
        data: {
          headline: dto.headline,
          description: dto.description,
          targetFunding: dto.targetFunding,
          dueTo: dto.dueTo,
          banner: bannerImageurl,
          slug,
          category_id: dto.categoryId,
          user_id: userId,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getCampaigns(dto: PaginationDto) {
    try {
      const { categoryId, page, sort } = dto;
      const limit = 3;
      const skip = (page - 1) * limit;

      const whereCondition = categoryId ? { category_id: categoryId } : {};

      const [items, totalItems] = await this.prisma.$transaction([
        this.prisma.campaign.findMany({
          take: limit,
          skip: skip,
          where: whereCondition,
          orderBy: { createdAt: sort },
          include: {
            user: {
              select: {
                username: true,
                photoProfileUrl: true,
                id: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
        }),
        this.prisma.campaign.count({ where: whereCondition }),
      ]);

      const totalPages = Math.ceil(totalItems / limit);
      const nextPage =
        page < totalPages ? `/campaigns?page=${page + 1}&limit=${limit}` : null;
      const prevPage =
        page > 1 ? `/campaigns?page=${page - 1}&limit=${limit}` : null;

      return {
        items,
        meta: {
          totalItems,
          currentPage: page,
          totalPages,
          perPage: limit,
        },
        links: {
          prev: prevPage,
          next: nextPage,
        },
      };
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getNewestCampaigns() {
    try {
      return this.prisma.campaign.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
              photoProfileUrl: true,
              id: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getCampaignsByUser(username: string, dto: PaginationDto) {
    try {
      const { page } = dto;
      const limit = 4;
      const skip = (page - 1) * limit;

      const [items, totalItems] = await this.prisma.$transaction([
        this.prisma.campaign.findMany({
          take: limit,
          skip: skip,
          where: {
            user: {
              username,
            },
          },
          include: {
            user: {
              select: {
                username: true,
                photoProfileUrl: true,
                id: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.campaign.count({ where: { user: { username } } }),
      ]);

      const totalPages = Math.ceil(totalItems / limit);
      const nextPage =
        page < totalPages ? `/campaigns?page=${page + 1}&limit=${limit}` : null;
      const prevPage =
        page > 1 ? `/campaigns?page=${page - 1}&limit=${limit}` : null;

      return {
        items,
        meta: {
          totalItems,
          currentPage: page,
          totalPages,
          perPage: limit,
        },
        links: {
          prev: prevPage,
          next: nextPage,
        },
      };
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getCampaignDetail(slug: string) {
    try {
      const detail = await this.prisma.campaign.findUnique({
        where: {
          slug: slug,
        },
        include: {
          user: {
            select: {
              username: true,
              photoProfileUrl: true,
              id: true,
            },
          },
          category: true,
        },
      });
      return detail;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async updateCampaign(
    dto: UpdateCampaignDto,
    banner: Express.Multer.File,
    userId: number,
    campaignId: number,
  ) {
    try {
      let bannerImageUrl = '';
      if (banner) {
        const campaign = await this.prisma.campaign.findFirst({
          where: {
            id: campaignId,
            user_id: userId,
          },
        });
        const currentCampaignBanner = campaign.banner;
        await this.cloudinaryImageUploadService.deleteImage(
          currentCampaignBanner,
        );

        bannerImageUrl = await this.cloudinaryImageUploadService.upload(banner);
        return this.prisma.campaign.update({
          where: {
            id: campaignId,
            user_id: userId,
          },
          data: {
            headline: dto.headline,
            description: dto.description,
            targetFunding: dto.targetFunding,
            category_id: dto.categoryId,
            dueTo: dto.dueTo,
            banner: bannerImageUrl,
          },
        });
      }

      return this.prisma.campaign.update({
        where: {
          id: campaignId,
          user_id: userId,
        },
        data: {
          headline: dto.headline,
          description: dto.description,
          targetFunding: dto.targetFunding,
          category_id: dto.categoryId,
          dueTo: dto.dueTo,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async findCampaignUsingTransaction(
    trx: Prisma.TransactionClient,
    payment: Prisma.PaymentCreateManyInput,
  ) {
    return await trx.campaign.findFirst({
      where: {
        id: payment.campaignId,
      },
    });
  }

  async updateCampaignUsingTransaction(
    trx: Prisma.TransactionClient,
    payment: Prisma.PaymentCreateManyInput,
  ) {
    return await trx.campaign.update({
      where: {
        id: payment.campaignId,
      },
      data: {
        currentFunding: {
          increment: payment.nominal,
        },
      },
    });
  }
}
