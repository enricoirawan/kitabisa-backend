import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig, fileFilter } from './multer.config';
import { CloudinaryImageUploadService } from './cloudinary-image-upload.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: multerConfig.storage,
      fileFilter: fileFilter,
    }),
  ],
  providers: [CloudinaryImageUploadService],
  exports: [CloudinaryImageUploadService, MulterModule],
})
export class FileUploadModule {}
