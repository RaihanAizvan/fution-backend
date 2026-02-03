import { IsInt, IsObject, IsString } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  type: string;

  @IsInt()
  orderIndex: number;

  @IsObject()
  data: Record<string, any>;
}
