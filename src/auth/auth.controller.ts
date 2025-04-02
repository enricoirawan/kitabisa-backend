import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './social/google-auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { User } from '@prisma/client';
import { RegisterUserDto } from 'src/common/dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user.id, response);
  }

  @Post('google-login')
  googleLogin(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.googleAuthService.googleLogin(dto, response);
  }
}
