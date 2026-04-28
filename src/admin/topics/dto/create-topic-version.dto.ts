import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTopicVersionDto {
  @IsOptional()
  @IsInt()
  version?: number;

  @IsString()
  markdown: string;
}

