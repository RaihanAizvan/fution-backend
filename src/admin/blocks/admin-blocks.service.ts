import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BlockType } from '../../blocks/block-type.enum';
import { validateBlock } from '../../blocks/block-validator';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';

@Injectable()
export class AdminBlocksService {
  constructor(private prisma: PrismaService) {}

  async createBlock(topicVersionId: string, payload: CreateBlockDto) {
    await this.ensureTopicVersion(topicVersionId);

    validateBlock(payload.type as BlockType, payload.data);

    return this.prisma.client.block.create({
      data: {
        topicVersionId,
        type: payload.type,
        orderIndex: payload.orderIndex,
        data: payload.data,
      },
    });
  }

  async updateBlock(topicVersionId: string, blockId: string, payload: UpdateBlockDto) {
    const block = await this.prisma.client.block.findFirst({
      where: { id: blockId, topicVersionId },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    const nextType = payload.type ?? block.type;
    const nextData = payload.data ?? block.data;

    validateBlock(nextType as BlockType, nextData);

    return this.prisma.client.block.update({
      where: { id: blockId },
      data: {
        type: nextType,
        data: nextData,
        orderIndex: payload.orderIndex ?? block.orderIndex,
      },
    });
  }

  async deleteBlock(topicVersionId: string, blockId: string) {
    const block = await this.prisma.client.block.findFirst({
      where: { id: blockId, topicVersionId },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    await this.prisma.client.block.delete({
      where: { id: blockId },
    });

    return { deleted: true };
  }

  async reorderBlocks(topicVersionId: string, payload: ReorderBlocksDto) {
    await this.ensureTopicVersion(topicVersionId);

    const ids = payload.blocks.map(block => block.blockId);
    const existing = await this.prisma.client.block.findMany({
      where: { topicVersionId, id: { in: ids } },
      select: { id: true },
    });

    if (existing.length !== ids.length) {
      throw new BadRequestException('One or more blocks not found');
    }

    await this.prisma.client.$transaction(
      payload.blocks.map(block =>
        this.prisma.client.block.update({
          where: { id: block.blockId },
          data: { orderIndex: block.orderIndex },
        }),
      ),
    );

    return { reordered: true };
  }

  private async ensureTopicVersion(topicVersionId: string) {
    const version = await this.prisma.client.topicVersion.findUnique({
      where: { id: topicVersionId },
    });

    if (!version) {
      throw new NotFoundException('Topic version not found');
    }
  }
}
