import { Body, Controller, Delete, Get, Param, Post, Patch, Query } from '@nestjs/common';
import { AdminTopicVersionsService } from './admin-topic-versions.service';
import { CreateTopicVersionDto } from './dto/create-topic-version.dto';

@Controller('admin/topics/:topicId/versions')
export class AdminTopicVersionsController {
  constructor(private readonly versionsService: AdminTopicVersionsService) { }

  @Get()
  listVersions(@Param('topicId') topicId: string) {
    return this.versionsService.listVersions(topicId);
  }

  @Get(':versionId')
  getVersion(
    @Param('topicId') topicId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionsService.getVersion(topicId, versionId);
  }

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

  @Patch(':versionId')
  updateVersion(
    @Param('topicId') topicId: string,
    @Param('versionId') versionId: string,
    @Body() payload: CreateTopicVersionDto,
  ) {
    return this.versionsService.updateVersion(topicId, versionId, payload);
  }

  @Delete(':versionId')
  deleteVersion(
    @Param('topicId') topicId: string,
    @Param('versionId') versionId: string,
    @Query('force') force?: string,
  ) {
    return this.versionsService.deleteVersion(topicId, versionId, force === 'true');
  }
}
