import { Injectable } from '@nestjs/common';
import { BlockType } from './block-type.enum';
import { normalizeBlockData } from './block-normalizer';
import { validateBlock } from './block-validator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BlocksService {
  constructor(private prisma: PrismaService) {}

  async getBlocksByTopic(topicSlug: string) {
    const topic = await this.prisma.client.topic.findFirst({
      where: { slug: topicSlug },
      include: {
        versions: {
          where: { isPublished: true },
          take: 1,
          orderBy: { version: 'desc' },
          include: {
            blocks: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!topic || topic.versions.length === 0) {
      return { topic: null, blocks: [] };
    }

    const blocks = topic.versions[0].blocks;

    const responseBlocks = blocks.map(block => {
      const normalizedData = normalizeBlockData(
        block.type as BlockType,
        block.data,
      );
      validateBlock(block.type as BlockType, normalizedData);

      return {
        type: block.type,
        data: normalizedData,
      };
    });

    return {
      topic: { slug: topic.slug, title: topic.title, isActive: topic.isActive },
      blocks: responseBlocks,
    };
  }
}
