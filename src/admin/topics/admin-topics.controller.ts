import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminTopicsService } from './admin-topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('admin/subjects/:subjectId/topics')
@UseGuards(AdminGuard)
export class AdminTopicsController {
  constructor(private readonly topicsService: AdminTopicsService) {}

  @Get()
  listTopics(@Param('subjectId') subjectId: string) {
    return this.topicsService.listTopics(subjectId);
  }

  @Post()
  createTopic(
    @Param('subjectId') subjectId: string,
    @Body() payload: CreateTopicDto,
  ) {
    return this.topicsService.createTopic(subjectId, payload);
  }

  @Patch(':topicId')
  updateTopic(
    @Param('subjectId') subjectId: string,
    @Param('topicId') topicId: string,
    @Body() payload: UpdateTopicDto,
  ) {
    return this.topicsService.updateTopic(subjectId, topicId, payload);
  }
}
