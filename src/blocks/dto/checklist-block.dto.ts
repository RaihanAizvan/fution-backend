import { IsArray, IsString } from 'class-validator';

export class ChecklistItemDto {
  @IsString()
  text: string;
}

export class ChecklistBlockDto {
  @IsArray()
  items: ChecklistItemDto[];
}
