import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) { }

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

  /**
   * Fetches the published content for a topic by its slug.
   * Includes raw markdown and pre-rendered HTML.
   *
   * @param slug - The unique slug of the topic.
   * @returns The topic information and its content, or null if not found.
   */
  async getTopicContent(slug: string) {

    const topic = await this.prisma.client.topic.findFirst({
      where: { slug, isActive: true },
      include: {
        versions: {
          where: { isPublished: true },
          take: 1,
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!topic || topic.versions.length === 0) {
      return null;
    }

    const version = topic.versions[0];

    return {
      topic: {
        slug: topic.slug,
        title: topic.title,
        isActive: topic.isActive,
      },
      markdown: version.markdown,
      html: version.html,
    };
  }
}




