import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TopicOrderItem {
  @IsString()
  topicId: string;

  @IsInt()
  orderIndex: number;
}

export class ReorderTopicsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicOrderItem)
  topics: TopicOrderItem[];
}
