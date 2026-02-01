import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BlockType } from './block-type.enum';

import { IntroBlockDto } from './dto/intro-block.dto';
import { CodeBlockDto } from './dto/code-block.dto';
import { AccordionBlockDto } from './dto/accordion-block.dto';

export function validateBlock(type: BlockType, data: any) {
  let dto;

  switch (type) {
    case BlockType.INTRO:
      dto = IntroBlockDto;
      break;

    case BlockType.CODE:
      dto = CodeBlockDto;
      break;

    case BlockType.ACCORDION:
      dto = AccordionBlockDto;
      break;

    default:
      return;
  }

  const instance = plainToInstance(dto, data);
  const errors = validateSync(instance);

  if (errors.length > 0) {
    throw new Error(`Invalid data for block type: ${type}`);
  }
}
