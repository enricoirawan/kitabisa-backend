import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryImageUploadService } from 'src/common/file-upload/cloudinary-image-upload.service';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';

@Module({
  imports: [PrismaModule, ConfigModule, FileUploadModule],
  controllers: [UsersController],
  providers: [UsersService, CloudinaryImageUploadService],
  exports: [UsersService],
})
export class UsersModule {}
