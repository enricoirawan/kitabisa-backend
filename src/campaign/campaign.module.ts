import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryImageUploadService } from 'src/common/file-upload/cloudinary-image-upload.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [CampaignController],
  providers: [CampaignService, CloudinaryImageUploadService],
  exports: [CampaignService],
})
export class CampaignModule {}
