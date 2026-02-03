import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateBlockDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  data?: Record<string, any>;
}
