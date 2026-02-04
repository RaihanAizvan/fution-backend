import { Type } from 'class-transformer';
import { IsArray, IsEmpty, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PitfallItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEmpty()
  content?: string;

  @IsOptional()
  @IsEmpty()
  text?: string;
}

export class PitfallsBlockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PitfallItemDto)
  items: PitfallItemDto[];
}
