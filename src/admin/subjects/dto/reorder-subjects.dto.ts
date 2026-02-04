import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SubjectOrderItem {
  @IsString()
  subjectId: string;

  @IsInt()
  orderIndex: number;
}

export class ReorderSubjectsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectOrderItem)
  subjects: SubjectOrderItem[];
}
