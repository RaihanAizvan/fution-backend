import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BlockType } from './block-type.enum';

import { IntroBlockDto } from './dto/intro-block.dto';
import { CodeBlockDto } from './dto/code-block.dto';
import { AccordionBlockDto } from './dto/accordion-block.dto';
import { ChecklistBlockDto } from './dto/checklist-block.dto';
import { PitfallsBlockDto } from './dto/pitfalls-block.dto';
import { ResourcesBlockDto } from './dto/resources-block.dto';

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

    case BlockType.CHECKLIST:
      dto = ChecklistBlockDto;
      break;

    case BlockType.PITFALLS:
      dto = PitfallsBlockDto;
      break;

    case BlockType.RESOURCES:
      dto = ResourcesBlockDto;
      break;

    default:
      throw new Error(`Unsupported block type: ${type}`);
  }

  const instance = plainToInstance(dto, data);
  const errors = validateSync(instance);

  if (errors.length > 0) {
    throw new Error(`Invalid data for block type: ${type}`);
  }
}
