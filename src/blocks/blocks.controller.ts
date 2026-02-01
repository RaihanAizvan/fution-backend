import { Controller, Get, Param } from '@nestjs/common';
import { BlocksService } from './blocks.service';

@Controller('topics/:topicSlug/content')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  getTopicContent(
    @Param('topicSlug') topicSlug: string
  ) {
    return this.blocksService.getBlocksByTopic(topicSlug)
  }
}