import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinDate,
  MinLength,
} from 'class-validator';
import { startOfDay } from 'date-fns';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty({
    message: 'Judul headline campaign harus diisi dengan jelas',
  })
  headline: string;

  @IsString()
  @MinLength(10, {
    message:
      'Deskripsi minimal harus 10 karakter dan menjelaskan tujuan dari campaign',
  })
  description: string;

  @IsNumber()
  @Min(500000, { message: 'Target campaign minimal Rp.500.000' })
  targetFunding: number;

  @IsDate()
  @MinDate(startOfDay(new Date()), {
    message: 'Batas akhir campaign minimal di hari ini',
  })
  @Type(() => Date)
  dueTo: Date;

  @IsNumber()
  @IsNotEmpty({ message: 'Category wajib dipilih' })
  categoryId: number;
}
