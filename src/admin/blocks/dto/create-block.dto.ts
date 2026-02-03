import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  type: string;

  @IsInt()
  orderIndex: number;

  @IsOptional()
  data?: Record<string, any>;
}
