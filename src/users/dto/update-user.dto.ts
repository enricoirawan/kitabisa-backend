import { IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(3, { message: 'Username minimal harus 3 karakter' })
  username: string;
}
