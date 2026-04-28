import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { ContentController } from './content.controller';
import { TopicsService } from './topics.service';

@Module({
  controllers: [TopicsController, ContentController],
  providers: [TopicsService]
})
export class TopicsModule { }

