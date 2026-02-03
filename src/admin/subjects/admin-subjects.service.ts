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
    return this.prisma.client.subject.create({
      data: {
        slug: payload.slug,
        title: payload.title,
        description: payload.description ?? null,
        orderIndex: payload.orderIndex,
        isActive: payload.isActive ?? true,
      },
    });
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
}
