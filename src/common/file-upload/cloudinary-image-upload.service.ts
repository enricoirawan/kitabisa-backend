import { BadGatewayException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import { getImagePublicId } from '../utils';

@Injectable()
export class CloudinaryImageUploadService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    // Init cloudinary config
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async upload(file: Express.Multer.File): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path);
      fs.unlinkSync(file.path); // Hapus file dari folder uploads biar size project tidak besar
      return result.url;
    } catch (error) {
      fs.unlinkSync(file.path); // Hapus file dari folder uploads biar size project tidak besar
      throw new BadGatewayException('Upload gambar gagal');
    }
  }

  async deleteImage(imageUrl: string) {
    try {
      const imagePublicId = getImagePublicId(imageUrl);
      return await cloudinary.uploader.destroy(imagePublicId);
    } catch (error) {
      throw new BadGatewayException('Hapus gambar gagal');
    }
  }
}
