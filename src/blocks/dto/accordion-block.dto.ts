import { Type } from 'class-transformer';
import { IsArray, IsEmpty, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class AccordionItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEmpty()
  content?: string;
}

export class AccordionBlockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccordionItemDto)
  items: AccordionItemDto[];
}
