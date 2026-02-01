import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async getTopicsBySubject(subjectSlug: string) {
    const subject = await this.prisma.client.subject.findFirst({
      where: { slug: subjectSlug, isActive: true },
      include: {
        topics: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            level: true,
            orderIndex: true,
          },
        },
      },
    });

    if (!subject) {
      return [];
    }

    return subject.topics;
  }
}


