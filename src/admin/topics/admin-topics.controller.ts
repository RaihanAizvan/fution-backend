import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { AdminTopicsService } from './admin-topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ReorderTopicsDto } from './dto/reorder-topics.dto';

@Controller('admin/subjects/:subjectId/topics')
export class AdminTopicsController {
  constructor(private readonly topicsService: AdminTopicsService) { }

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

  @Delete(':topicId')
  deleteTopic(
    @Param('subjectId') subjectId: string,
    @Param('topicId') topicId: string,
    @Query('force') force?: string,
  ) {
    return this.topicsService.deleteTopic(subjectId, topicId, force === 'true');
  }

  @Put('reorder')
  reorderTopics(
    @Param('subjectId') subjectId: string,
    @Body() payload: ReorderTopicsDto,
  ) {
    return this.topicsService.reorderTopics(subjectId, payload.topics);
  }
}
