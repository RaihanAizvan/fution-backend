import { Injectable } from '@nestjs/common';
import { BlockType } from './block-type.enum';
import { validateBlock } from './block-validator';

@Injectable()
export class BlocksService {
  getBlocksByTopic(topicSlug: string) {
    const blocks = [
      {
        type: BlockType.INTRO,
        data: {
          title: 'Functions',
          description:
            'Functions are reusable blocks of logic.'
        }
      },
      {
        type: BlockType.CODE,
        data: {
          language: 'javascript',
          code:
            'function add(a, b) { return a + b }'
        }
      }
    ];

    blocks.forEach(block =>
      validateBlock(block.type, block.data)
    );

    return {
      topic: { slug: topicSlug },
      blocks
    };
  }
}

