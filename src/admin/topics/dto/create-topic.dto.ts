import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  level: string;

  @IsInt()
  orderIndex: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
