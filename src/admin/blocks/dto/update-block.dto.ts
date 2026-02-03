import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateBlockDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
