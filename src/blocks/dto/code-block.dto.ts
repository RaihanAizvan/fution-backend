import { IsString } from 'class-validator';

export class CodeBlockDto {
  @IsString()
  language: string;

  @IsString()
  code: string;
}
