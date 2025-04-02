import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import * as ms from 'ms';
import { RegisterUserDto } from 'src/common/dto/register-user.dto';
import { TokenPayload } from 'src/common/interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    return this.usersService.createUser(dto);
  }

  async login(userId: number, response: Response) {
    try {
      return this.generateToken(userId, response);
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({ email });

      const comparedPassword = await bcrypt.compare(password, user.password);

      if (!comparedPassword) {
        throw new UnauthorizedException('Email atau password salah');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Email atau password salah');
    }
  }

  async generateToken(userId: number, response: Response) {
    const expires = new Date();
    const expiresJwt = Number(
      ms(this.configService.getOrThrow('JWT_EXPIRATION')),
    );
    expires.setMilliseconds(expires.getMilliseconds() + expiresJwt);

    const tokenPayload: TokenPayload = {
      userId: userId,
    };
    const token = this.jwtService.sign(tokenPayload);
    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      expires,
    });
    return { tokenPayload };
  }

  async verifyToken(jwtToken: string) {
    return this.jwtService.verify(jwtToken);
  }
}
