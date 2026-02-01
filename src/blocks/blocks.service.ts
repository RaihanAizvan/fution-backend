import { Injectable } from '@nestjs/common';
import { BlockType } from './block-type.enum';
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

    blocks.forEach(block =>
      validateBlock(block.type as BlockType, block.data)
    );

    return {
      topic: { slug: topic.slug, title: topic.title },
      blocks,
    };
  }
}
