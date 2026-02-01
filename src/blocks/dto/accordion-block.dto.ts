import { IsArray, IsString } from 'class-validator';

export class AccordionItemDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}

export class AccordionBlockDto {
  @IsArray()
  items: AccordionItemDto[];
}
