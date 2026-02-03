import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  orderIndex: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
