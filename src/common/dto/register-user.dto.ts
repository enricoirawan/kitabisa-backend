import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail(
    {},
    {
      message: 'Email tidak valid',
    },
  )
  email: string;

  @IsString()
  @MinLength(3, { message: 'Username minimal harus 3 karakter' })
  username: string;

  @IsString()
  @MinLength(3, { message: 'Password minimal harus 3 karakter' })
  password: string;
}
