import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminTopicVersionsService } from './admin-topic-versions.service';
import { CreateTopicVersionDto } from './dto/create-topic-version.dto';

@Controller('admin/topics/:topicId/versions')
@UseGuards(AdminGuard)
export class AdminTopicVersionsController {
  constructor(private readonly versionsService: AdminTopicVersionsService) {}

  @Post()
  createVersion(
    @Param('topicId') topicId: string,
    @Body() payload: CreateTopicVersionDto,
  ) {
    return this.versionsService.createDraftVersion(topicId, payload);
  }

  @Post(':versionId/publish')
  publishVersion(
    @Param('topicId') topicId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionsService.publishVersion(topicId, versionId);
  }
}
