import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { getNameFromEmail } from 'src/common/utils';

@Injectable()
export class GoogleAuthService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async googleLogin(dto: GoogleLoginDto, response: Response) {
    try {
      // Verify the google token
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: dto.token,
      });

      // ambil payload dari google JWT
      const {
        email,
        sub: googleClientId,
        picture: photoProfileUrl,
      } = loginTicket.getPayload();

      // cek the user di database berdasarkan googleId
      const user = await this.usersService.getUser({
        googleClientId,
      });

      // If googleId exists generate token
      if (user) {
        return this.authService.generateToken(user.id, response);
      }

      // if not, create a new user and then generate the tokens
      const username = getNameFromEmail(email);
      const newUser = await this.usersService.createUserGoogle({
        email,
        googleClientId,
        username,
        photoProfileUrl,
      });

      // Generate JWT Token
      return this.authService.generateToken(newUser.id, response);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
