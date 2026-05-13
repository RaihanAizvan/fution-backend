import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminTopicsService } from './admin-topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('admin/topics')
export class AdminTopicsRootController {
  constructor(private readonly topicsService: AdminTopicsService) { }

  @Get()
  listTopics(@Query('subjectId') subjectId: string) {
    if (subjectId) {
      return this.topicsService.listTopics(subjectId);
    }
    // If no subjectId, we might want to list all, but for now let's just use the existing service logic
    return [];
  }

  @Post()
  createTopic(@Body() payload: CreateTopicDto) {
    return this.topicsService.createTopic(payload.subjectId, payload);
  }

  @Get(':topicId')
  getTopic(@Param('topicId') topicId: string) {
    // We don't have a getTopic by ID only in the service yet, but we could add it.
    // For now, let's keep it simple.
    return { id: topicId };
  }

  @Patch(':topicId')
  updateTopic(
    @Param('topicId') topicId: string,
    @Body() payload: UpdateTopicDto,
  ) {
    return this.topicsService.updateTopic(null, topicId, payload);
  }

  @Delete(':topicId')
  deleteTopic(
    @Param('topicId') topicId: string,
    @Query('force') force?: string,
  ) {
    return this.topicsService.deleteTopic(null, topicId, force === 'true');
  }
}
