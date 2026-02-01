import { IsString, IsOptional } from 'class-validator';

export class IntroBlockDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  description: string;
}
