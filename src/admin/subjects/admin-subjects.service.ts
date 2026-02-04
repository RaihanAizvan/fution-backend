import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class AdminSubjectsService {
  constructor(private prisma: PrismaService) {}

  async listSubjects() {
    return this.prisma.client.subject.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        orderIndex: true,
        isActive: true,
      },
    });
  }

  async createSubject(payload: CreateSubjectDto) {
    const existing = await this.prisma.client.subject.findFirst({
      where: { slug: payload.slug },
    });

    if (existing) {
      throw new BadRequestException('Subject slug already exists');
    }

    const orderIndex = payload.orderIndex ?? (await this.getNextOrderIndex());

    return this.prisma.client.subject.create({
      data: {
        slug: payload.slug,
        title: payload.title,
        description: payload.description ?? null,
        orderIndex,
        isActive: payload.isActive ?? true,
      },
    });
  }

  private async getNextOrderIndex() {
    const last = await this.prisma.client.subject.findFirst({
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    return (last?.orderIndex ?? 0) + 1;
  }

  async updateSubject(subjectId: string, payload: UpdateSubjectDto) {
    const subject = await this.prisma.client.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (payload.slug) {
      const existing = await this.prisma.client.subject.findFirst({
        where: {
          slug: payload.slug,
          id: { not: subjectId },
        },
      });

      if (existing) {
        throw new BadRequestException('Subject slug already exists');
      }
    }

    return this.prisma.client.subject.update({
      where: { id: subjectId },
      data: {
        slug: payload.slug ?? subject.slug,
        title: payload.title ?? subject.title,
        description: payload.description ?? subject.description,
        orderIndex: payload.orderIndex ?? subject.orderIndex,
        isActive: payload.isActive ?? subject.isActive,
      },
    });
  }

  async deleteSubject(subjectId: string) {
    const subject = await this.prisma.client.subject.findUnique({
      where: { id: subjectId },
      include: {
        topics: {
          include: {
            versions: {
              where: { isPublished: true },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Check if any topics have published content
    const hasPublishedContent = subject.topics.some(
      (topic) => topic.versions.length > 0,
    );

    if (hasPublishedContent) {
      throw new BadRequestException(
        'Cannot delete subject with published topic content. Deactivate it instead or unpublish the content first.',
      );
    }

    // Delete cascade: topics -> topic versions -> blocks (handled by DB cascade)
    return this.prisma.client.subject.delete({
      where: { id: subjectId },
    });
  }
}
