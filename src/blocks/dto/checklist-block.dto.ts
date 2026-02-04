import { Type } from 'class-transformer';
import { IsArray, IsEmpty, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEmpty()
  text?: string;
}

export class ChecklistBlockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items: ChecklistItemDto[];
}
