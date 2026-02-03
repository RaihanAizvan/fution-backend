import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class AdminTopicsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.client.topic.create({
      data: {
        subjectId,
        slug: payload.slug,
        title: payload.title,
        level: payload.level,
        orderIndex: payload.orderIndex,
        isActive: payload.isActive ?? true,
      },
    });
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
}
