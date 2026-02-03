import { IsInt, IsOptional } from 'class-validator';

export class CreateTopicVersionDto {
  @IsOptional()
  @IsInt()
  version?: number;
}
