import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
