import { IsArray, IsString } from 'class-validator';

export class PitfallItemDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class PitfallsBlockDto {
  @IsArray()
  items: PitfallItemDto[];
}
