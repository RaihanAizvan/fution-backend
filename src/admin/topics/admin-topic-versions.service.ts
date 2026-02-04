import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockType } from '../../blocks/block-type.enum';
import { normalizeBlockData } from '../../blocks/block-normalizer';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTopicVersionDto } from './dto/create-topic-version.dto';

@Injectable()
export class AdminTopicVersionsService {
  constructor(private prisma: PrismaService) {}

  async listVersions(topicId: string) {
    const topic = await this.prisma.client.topic.findUnique({
      where: { id: topicId },
      select: { id: true },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return this.prisma.client.topicVersion.findMany({
      where: { topicId },
      orderBy: { version: 'asc' },
      select: {
        id: true,
        version: true,
        isPublished: true,
        createdAt: true,
      },
    });
  }

  async getVersion(topicId: string, versionId: string) {
    const version = await this.prisma.client.topicVersion.findFirst({
      where: { id: versionId, topicId },
      include: {
        blocks: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            type: true,
            orderIndex: true,
            data: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundException('Topic version not found');
    }

    return {
      id: version.id,
      topicId: version.topicId,
      version: version.version,
      isPublished: version.isPublished,
      createdAt: version.createdAt,
      blocks: version.blocks.map(block => ({
        ...block,
        data: normalizeBlockData(block.type as BlockType, block.data),
      })),
    };
  }

  async createDraftVersion(topicId: string, payload: CreateTopicVersionDto) {
    const topic = await this.prisma.client.topic.findUnique({
      where: { id: topicId },
      include: { versions: true },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const nextVersion = payload.version ??
      (topic.versions.length
        ? Math.max(...topic.versions.map(version => version.version)) + 1
        : 1);

    return this.prisma.client.topicVersion.create({
      data: {
        topicId,
        version: nextVersion,
        isPublished: false,
      },
    });
  }

  async publishVersion(topicId: string, versionId: string) {
    const version = await this.prisma.client.topicVersion.findFirst({
      where: { id: versionId, topicId },
    });

    if (!version) {
      throw new NotFoundException('Topic version not found');
    }

    await this.prisma.client.$transaction([
      this.prisma.client.topicVersion.updateMany({
        where: { topicId, isPublished: true },
        data: { isPublished: false },
      }),
      this.prisma.client.topicVersion.update({
        where: { id: versionId },
        data: { isPublished: true },
      }),
    ]);

    return this.prisma.client.topicVersion.findUnique({
      where: { id: versionId },
    });
  }
}
