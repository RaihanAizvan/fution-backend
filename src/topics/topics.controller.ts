import { Controller, Get, Param } from '@nestjs/common';
import { TopicsService } from './topics.service';

@Controller('subjects/:subjectSlug/topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  getTopicsBySubject(
    @Param('subjectSlug') subjectSlug: string
  ) {
    console.log('HIT TOPICS CONTROLLER', subjectSlug)
    return this.topicsService.getTopicsBySubject(subjectSlug)
  }
}

