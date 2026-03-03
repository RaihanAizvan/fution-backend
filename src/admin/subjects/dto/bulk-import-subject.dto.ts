import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class BulkBlockDto {
  @IsString()
  type: string;

  @IsObject()
  data: Record<string, any>;
}

class BulkTopicVersionDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  markdown?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkBlockDto)
  blocks: BulkBlockDto[];
}

class BulkTopicDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkTopicVersionDto)
  versions: BulkTopicVersionDto[];
}

class BulkSubjectDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BulkImportSubjectDto {
  @ValidateNested()
  @Type(() => BulkSubjectDto)
  subject: BulkSubjectDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkTopicDto)
  topics: BulkTopicDto[];
}
