import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page harus diisi min 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'sort harus asc / desc' })
  sort?: 'asc' | 'desc' = 'desc';
}
