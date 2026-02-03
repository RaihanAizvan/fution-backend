import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateTopicDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
