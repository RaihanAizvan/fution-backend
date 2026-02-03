import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderBlockItemDto {
  @IsString()
  blockId: string;

  @IsInt()
  orderIndex: number;
}

export class ReorderBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderBlockItemDto)
  blocks: ReorderBlockItemDto[];
}
