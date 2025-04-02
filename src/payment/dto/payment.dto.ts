import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Minimal Rp.1' })
  nominal: number;

  @IsNumber()
  @Type(() => Number)
  campaignId: number;

  @IsString()
  @IsNotEmpty({ message: 'slug harus diisi' })
  slug: string;

  @IsString()
  @IsOptional()
  message?: string;
}
