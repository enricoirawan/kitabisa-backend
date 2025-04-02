import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { FileUploadInterceptor } from 'src/common/file-upload/file-upload.interceptor';
import { TokenPayload } from 'src/common/interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: TokenPayload) {
    return this.usersService.getMe(user.userId);
  }

  @Patch('edit')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileUploadInterceptor)
  updateUser(
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateUser(dto, file, user.userId);
  }
}
