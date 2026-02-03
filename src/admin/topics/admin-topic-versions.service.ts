import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTopicVersionDto } from './dto/create-topic-version.dto';

@Injectable()
export class AdminTopicVersionsService {
  constructor(private prisma: PrismaService) {}

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
