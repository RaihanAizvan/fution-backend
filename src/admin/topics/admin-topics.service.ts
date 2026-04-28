import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class AdminTopicsService {
  constructor(private prisma: PrismaService) { }

  async listTopics(subjectId: string) {
    const subject = await this.prisma.client.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return this.prisma.client.topic.findMany({
      where: { subjectId },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        level: true,
        orderIndex: true,
        isActive: true,
      },
    });
  }

  async createTopic(subjectId: string, payload: CreateTopicDto) {
    const subject = await this.prisma.client.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const existing = await this.prisma.client.topic.findFirst({
      where: { subjectId, slug: payload.slug },
    });

    if (existing) {
      throw new BadRequestException('Topic slug already exists for subject');
    }

    const orderIndex = payload.orderIndex ?? (await this.getNextOrderIndex(subjectId));

    return this.prisma.client.topic.create({
      data: {
        subjectId,
        slug: payload.slug,
        title: payload.title,
        level: payload.level,
        orderIndex,
        isActive: payload.isActive ?? true,
      },
    });
  }

  private async getNextOrderIndex(subjectId: string) {
    const last = await this.prisma.client.topic.findFirst({
      where: { subjectId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    return (last?.orderIndex ?? 0) + 1;
  }

  async updateTopic(subjectId: string, topicId: string, payload: UpdateTopicDto) {
    const topic = await this.prisma.client.topic.findFirst({
      where: { id: topicId, subjectId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (payload.slug) {
      const existing = await this.prisma.client.topic.findFirst({
        where: {
          subjectId,
          slug: payload.slug,
          id: { not: topicId },
        },
      });

      if (existing) {
        throw new BadRequestException('Topic slug already exists for subject');
      }
    }

    return this.prisma.client.topic.update({
      where: { id: topicId },
      data: {
        slug: payload.slug ?? topic.slug,
        title: payload.title ?? topic.title,
        level: payload.level ?? topic.level,
        orderIndex: payload.orderIndex ?? topic.orderIndex,
        isActive: payload.isActive ?? topic.isActive,
      },
    });
  }

  async deleteTopic(subjectId: string, topicId: string) {
    const topic = await this.prisma.client.topic.findFirst({
      where: { id: topicId, subjectId },
      include: {
        versions: {
          where: { isPublished: true },
          select: { id: true },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.versions.length > 0) {
      throw new BadRequestException(
        'Cannot delete topic with published content. Deactivate it instead or unpublish the versions first.',
      );
    }

    const versions = await this.prisma.client.topicVersion.findMany({
      where: { topicId },
      select: { id: true },
    });
    const versionIds = versions.map(version => version.id);

    await this.prisma.client.$transaction(async tx => {
      // Delete all associated versions first to maintain referential integrity
      if (versionIds.length > 0) {
        await tx.topicVersion.deleteMany({
          where: { id: { in: versionIds } },
        });
      }


      await tx.topic.delete({
        where: { id: topicId },
      });
    });

    return { deleted: true };
  }

  async reorderTopics(subjectId: string, topics: { topicId: string; orderIndex: number }[]) {
    const subject = await this.prisma.client.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const topicIds = topics.map(t => t.topicId);
    const existingTopics = await this.prisma.client.topic.findMany({
      where: { id: { in: topicIds }, subjectId },
      select: { id: true },
    });

    if (existingTopics.length !== topicIds.length) {
      throw new BadRequestException('One or more topics not found or do not belong to this subject');
    }

    await this.prisma.client.$transaction(
      topics.map(({ topicId, orderIndex }) =>
        this.prisma.client.topic.update({
          where: { id: topicId },
          data: { orderIndex },
        }),
      ),
    );

    return { message: 'Topics reordered successfully' };
  }
}
