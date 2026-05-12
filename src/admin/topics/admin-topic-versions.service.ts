import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTopicVersionDto } from './dto/create-topic-version.dto';
import { renderMarkdownToHtml } from '../../utils/markdown-renderer.util';


@Injectable()
export class AdminTopicVersionsService {
  constructor(private prisma: PrismaService) { }

  async listVersions(topicId: string) {
    const topic = await this.prisma.client.topic.findUnique({
      where: { id: topicId },
      select: { id: true },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    return this.prisma.client.topicVersion.findMany({
      where: { topicId },
      orderBy: { version: 'asc' },
      select: {
        id: true,
        version: true,
        isPublished: true,
        createdAt: true,
        markdown: true,
        html: true,
      },
    });
  }


  async getVersion(topicId: string, versionId: string) {
    const version = await this.prisma.client.topicVersion.findFirst({
      where: { id: versionId, topicId },
    });

    if (!version) {
      throw new NotFoundException(`Topic version with ID ${versionId} not found for this topic`);
    }

    return version;
  }


  async createDraftVersion(topicId: string, payload: CreateTopicVersionDto) {
    const topic = await this.prisma.client.topic.findUnique({
      where: { id: topicId },
      select: { id: true },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    let nextVersion: number;

    if (payload.version) {
      // Check if specific version already exists
      const existing = await this.prisma.client.topicVersion.findUnique({
        where: {
          topicId_version: {
            topicId,
            version: payload.version,
          },
        },
      });

      if (existing) {
        throw new BadRequestException(`Version ${payload.version} already exists for this topic. Please use a different version number or update the existing one.`);
      }
      nextVersion = payload.version;
    } else {
      // Calculate next version
      const lastVersion = await this.prisma.client.topicVersion.findFirst({
        where: { topicId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      nextVersion = (lastVersion?.version ?? 0) + 1;
    }

    const html = payload.markdown ? await renderMarkdownToHtml(payload.markdown) : '';

    return this.prisma.client.topicVersion.create({
      data: {
        topicId,
        version: nextVersion,
        isPublished: false,
        markdown: payload.markdown ?? '',
        html,
      },
    });
  }


  async publishVersion(topicId: string, versionId: string) {
    const version = await this.prisma.client.topicVersion.findFirst({
      where: { id: versionId, topicId },
    });

    if (!version) {
      throw new NotFoundException(`Topic version with ID ${versionId} not found for this topic`);
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

  async updateVersion(topicId: string, versionId: string, payload: CreateTopicVersionDto) {
    const version = await this.prisma.client.topicVersion.findFirst({
      where: { id: versionId, topicId },
    });

    if (!version) {
      throw new NotFoundException(`Topic version with ID ${versionId} not found for this topic`);
    }

    // If a new version number is provided, check for conflicts (unless it's the same)
    if (payload.version && payload.version !== version.version) {
      const existing = await this.prisma.client.topicVersion.findUnique({
        where: {
          topicId_version: {
            topicId,
            version: payload.version,
          },
        },
      });

      if (existing) {
        throw new BadRequestException(`Cannot update to version ${payload.version} as it already exists.`);
      }
    }

    const html = payload.markdown ? await renderMarkdownToHtml(payload.markdown) : version.html;

    return this.prisma.client.topicVersion.update({
      where: { id: versionId },
      data: {
        version: payload.version ?? version.version,
        markdown: payload.markdown ?? version.markdown,
        html,
      },
    });
  }

}
