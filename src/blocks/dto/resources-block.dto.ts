import { IsArray, IsString } from 'class-validator';

export class ResourceItemDto {
  @IsString()
  title: string;

  @IsString()
  url: string;
}

export class ResourcesBlockDto {
  @IsArray()
  items: ResourceItemDto[];
}
