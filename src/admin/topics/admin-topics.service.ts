import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { renderMarkdownToHtml } from '../../utils/markdown-renderer.util';

@Injectable()
export class AdminTopicsService {
  constructor(private prisma: PrismaService) { }

  async listTopics(subjectId: string) {
    const subject = await this.prisma.client.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
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

  async createTopic(subjectId: string | undefined, payload: CreateTopicDto) {
    // Use subjectId from path if provided, otherwise from body
    const finalSubjectId = subjectId || payload.subjectId;

    if (!finalSubjectId) {
      throw new BadRequestException('Subject ID is required');
    }

    const subject = await this.prisma.client.subject.findUnique({
      where: { id: finalSubjectId },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${finalSubjectId} not found`);
    }

    const existing = await this.prisma.client.topic.findFirst({
      where: { subjectId: finalSubjectId, slug: payload.slug },
    });

    if (existing) {
      throw new BadRequestException(`Topic with slug "${payload.slug}" already exists for this subject`);
    }

    const orderIndex = payload.orderIndex ?? (await this.getNextOrderIndex(finalSubjectId));

    return this.prisma.client.$transaction(async (tx) => {
      const topic = await tx.topic.create({
        data: {
          subjectId: finalSubjectId,
          slug: payload.slug,
          title: payload.title,
          level: payload.level,
          orderIndex,
          isActive: payload.isActive ?? true,
        },
      });

      if (payload.markdown) {
        const html = await renderMarkdownToHtml(payload.markdown);
        await tx.topicVersion.create({
          data: {
            topicId: topic.id,
            version: 1,
            isPublished: true,
            markdown: payload.markdown,
            html,
          },
        });
      }

      return topic;
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

  async updateTopic(subjectId: string | null | undefined, topicId: string, payload: UpdateTopicDto) {
    const topic = await this.prisma.client.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    // If subjectId is provided from path, verify it matches
    if (subjectId && topic.subjectId !== subjectId) {
        throw new BadRequestException('Topic does not belong to the specified subject');
    }

    if (payload.slug) {
      const existing = await this.prisma.client.topic.findFirst({
        where: {
          subjectId: topic.subjectId,
          slug: payload.slug,
          id: { not: topicId },
        },
      });

      if (existing) {
        throw new BadRequestException(`Topic with slug "${payload.slug}" already exists for this subject`);
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

  async deleteTopic(subjectId: string | null | undefined, topicId: string) {
    const topic = await this.prisma.client.topic.findUnique({
      where: { id: topicId },
      include: {
        versions: {
          where: { isPublished: true },
          select: { id: true },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    // If subjectId is provided from path, verify it matches
    if (subjectId && topic.subjectId !== subjectId) {
        throw new BadRequestException('Topic does not belong to the specified subject');
    }

    if (topic.versions.length > 0) {
      throw new BadRequestException(
        'Cannot delete topic with published content. Deactivate it instead or unpublish the versions first.',
      );
    }

    await this.prisma.client.$transaction(async tx => {
      // Delete all associated versions first to maintain referential integrity
      await tx.topicVersion.deleteMany({
        where: { topicId },
      });

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
