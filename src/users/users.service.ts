import {
  BadGatewayException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { dicebarAPI } from 'src/common/constant';
import { getInitial } from 'src/common/utils';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryImageUploadService } from 'src/common/file-upload/cloudinary-image-upload.service';
import { GoogleUser } from 'src/common/interface';
import { RegisterUserDto } from 'src/common/dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryImageUploadService: CloudinaryImageUploadService,
  ) {}

  async getUser(filter: Prisma.UserWhereInput) {
    try {
      return await this.prisma.user.findFirst({
        where: filter,
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getUserUsingTransaction(trx: Prisma.TransactionClient, userId: number) {
    try {
      return await trx.user.findFirst({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async createUser(dto: RegisterUserDto) {
    try {
      const user = { ...dto };

      // Check if email alreadt exists
      const isEmailExists = await this.prisma.user.findFirst({
        where: {
          email: user.email,
        },
      });

      if (isEmailExists) {
        throw new ConflictException(
          'Email yang digunakan sudah pernah terdaftar, silahkan gunakan email lain.',
        );
      }

      // Hash password
      user.password = await bcrypt.hash(user.password, 10);
      const photoProfileUrl = dicebarAPI + getInitial(user.username);
      const createdUser = await this.prisma.user.create({
        data: {
          ...user,
          photoProfileUrl,
        },
        select: {
          id: true,
          username: true,
          email: true,
          photoProfileUrl: true,
        },
      });
      return createdUser;
    } catch (error) {
      throw error;
    }
  }

  async getMe(userId: number) {
    try {
      return this.prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          username: true,
          photoProfileUrl: true,
          createdAt: true,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async createUserGoogle(googleUser: GoogleUser) {
    try {
      return await this.prisma.user.create({
        data: {
          ...googleUser,
        },
        select: {
          id: true,
          username: true,
          email: true,
          photoProfileUrl: true,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async updateUser(
    dto: UpdateUserDto,
    file: Express.Multer.File,
    userId: number,
  ) {
    try {
      // Ambil username dari database
      const usernameExisting = await this.prisma.user.findFirst({
        where: {
          username: dto.username,
        },
      });

      if (!usernameExisting) {
        await this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            username: dto.username,
          },
        });

        if (file) {
          const currentPhotoProfile = (await this.getUser({ id: userId }))
            .photoProfileUrl;
          await this.cloudinaryImageUploadService.deleteImage(
            currentPhotoProfile,
          );
          const imageUrl = await this.cloudinaryImageUploadService.upload(file);
          await this.prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              photoProfileUrl: imageUrl,
            },
          });
          return true;
        }
        return true;
      }
      // Cek apakah usernameExisting.username && usernameExisting.id sama dengan user yang request/sekarang
      else if (
        usernameExisting.username === dto.username &&
        usernameExisting.id === userId
      ) {
        // Kalau sama, maka cukup update photo profile aja (file existing)
        if (file) {
          const currentPhotoProfile = (await this.getUser({ id: userId }))
            .photoProfileUrl;
          await this.cloudinaryImageUploadService.deleteImage(
            currentPhotoProfile,
          );
          const imageUrl = await this.cloudinaryImageUploadService.upload(file);
          await this.prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              photoProfileUrl: imageUrl,
            },
          });
          return true;
        }
        return true;
      } else {
        // Kalau beda maka throw error ConflictException
        return new ConflictException(
          'username sudah digunakan, silahlan gunakan username lain',
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
