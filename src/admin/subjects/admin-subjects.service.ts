import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BulkImportSubjectDto } from './dto/bulk-import-subject.dto';
import { renderMarkdownToHtml } from '../../utils/markdown-renderer.util';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class AdminSubjectsService {
  constructor(private prisma: PrismaService) { }

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

    const topics = await this.prisma.client.topic.findMany({
      where: { subjectId },
      select: { id: true },
    });
    const topicIds = topics.map(topic => topic.id);

    await this.prisma.client.$transaction(async tx => {
      if (topicIds.length > 0) {
        await tx.topicVersion.deleteMany({
          where: { topicId: { in: topicIds } },
        });

        await tx.topic.deleteMany({
          where: { id: { in: topicIds } },
        });
      }

      await tx.subject.delete({
        where: { id: subjectId },
      });
    });

    return { deleted: true };
  }

  async reorderSubjects(subjects: { subjectId: string; orderIndex: number }[]) {
    // Verify all subjects exist
    const subjectIds = subjects.map(s => s.subjectId);
    const existingSubjects = await this.prisma.client.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true },
    });

    if (existingSubjects.length !== subjectIds.length) {
      throw new BadRequestException('One or more subjects not found');
    }

    // Update all subjects in a transaction
    await this.prisma.client.$transaction(
      subjects.map(({ subjectId, orderIndex }) =>
        this.prisma.client.subject.update({
          where: { id: subjectId },
          data: { orderIndex },
        }),
      ),
    );

    return { message: 'Subjects reordered successfully' };
  }

  async importSubjectTree(payload: BulkImportSubjectDto) {
    const errors = this.validateImportPayload(payload);

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed for bulk import',
        errors,
      });
    }

    return this.prisma.client.$transaction(async (tx) => {
      // Upsert subject by its unique slug
      let subjectRecord = await tx.subject.findFirst({
        where: { slug: payload.subject.slug },
      });

      const subjectOrderIndex =
        payload.subject.orderIndex ??
        subjectRecord?.orderIndex ??
        (await this.getNextSubjectOrderIndex(tx));

      if (subjectRecord) {
        subjectRecord = await tx.subject.update({
          where: { id: subjectRecord.id },
          data: {
            title: payload.subject.title,
            orderIndex: subjectOrderIndex,
            isActive: payload.subject.isActive ?? subjectRecord.isActive,
          },
        });
      } else {
        subjectRecord = await tx.subject.create({
          data: {
            slug: payload.subject.slug,
            title: payload.subject.title,
            orderIndex: subjectOrderIndex,
            isActive: payload.subject.isActive ?? true,
          },
        });
      }

      for (const topicPayload of payload.topics) {
        const existingTopic = await tx.topic.findFirst({
          where: { subjectId: subjectRecord.id, slug: topicPayload.slug },
        });

        const topicOrderIndex = topicPayload.orderIndex ?? existingTopic?.orderIndex ?? (await this.getNextTopicOrderIndex(tx, subjectRecord.id));
        const topicLevel = topicPayload.level ?? existingTopic?.level;

        if (!topicLevel) {
          throw new BadRequestException(`Topic "${topicPayload.slug}" is missing a level (required for new topics)`);
        }

        const topicRecord = existingTopic
          ? await tx.topic.update({
            where: { id: existingTopic.id },
            data: {
              title: topicPayload.title,
              orderIndex: topicOrderIndex,
              isActive: topicPayload.isActive ?? existingTopic.isActive,
              level: topicLevel,
            },
          })
          : await tx.topic.create({
            data: {
              subjectId: subjectRecord.id,
              slug: topicPayload.slug,
              title: topicPayload.title,
              orderIndex: topicOrderIndex,
              isActive: topicPayload.isActive ?? true,
              level: topicLevel,
            },
          });

        let currentVersion = await tx.topicVersion.findFirst({
          where: { topicId: topicRecord.id },
          orderBy: { version: 'desc' },
          select: { version: true },
        });

        for (const versionPayload of topicPayload.versions) {
          const nextVersionNumber = (currentVersion?.version ?? 0) + 1;
          currentVersion = { version: nextVersionNumber };

          const html = await renderMarkdownToHtml(versionPayload.markdown);

          const createdVersion = await tx.topicVersion.create({
            data: {
              topicId: topicRecord.id,
              version: nextVersionNumber,
              isPublished: false,
              markdown: versionPayload.markdown,
              html,
            },
          });

          if (versionPayload.status === 'published') {
            await tx.topicVersion.updateMany({
              where: { topicId: topicRecord.id, isPublished: true },
              data: { isPublished: false },
            });

            await tx.topicVersion.update({
              where: { id: createdVersion.id },
              data: { isPublished: true },
            });
          }
        }
      }

      return { imported: true, subjectId: subjectRecord.id };
    }, {
      timeout: 60000, // 60 seconds for bulk import
    });
  }

  private validateImportPayload(payload: BulkImportSubjectDto) {
    const errors: string[] = [];

    payload.topics.forEach((topic, topicIndex) => {
      if (!topic.versions || topic.versions.length === 0) {
        errors.push(`topics[${topicIndex}].versions must not be empty`);
        return;
      }

      const publishedCount = topic.versions.filter(
        version => version.status === 'published',
      ).length;

      if (publishedCount > 1) {
        errors.push(`topics[${topicIndex}] has multiple published versions`);
      }

      topic.versions.forEach((version, versionIndex) => {
        if (version.status && version.status !== 'published') {
          errors.push(`topics[${topicIndex}].versions[${versionIndex}].status must be "published" or omitted`);
        }
        if (!version.markdown) {
          errors.push(`topics[${topicIndex}].versions[${versionIndex}].markdown is required`);
        }
      });
    });

    return errors;
  }

  private async getNextTopicOrderIndex(tx: Prisma.TransactionClient, subjectId: string) {
    const last = await tx.topic.findFirst({
      where: { subjectId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    return (last?.orderIndex ?? 0) + 1;
  }

  private async getNextSubjectOrderIndex(tx: Prisma.TransactionClient) {
    const last = await tx.subject.findFirst({
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    return (last?.orderIndex ?? 0) + 1;
  }
}
