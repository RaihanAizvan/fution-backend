import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminSubjectsController } from './subjects/admin-subjects.controller';
import { AdminSubjectsService } from './subjects/admin-subjects.service';
import { AdminTopicsController } from './topics/admin-topics.controller';
import { AdminTopicsService } from './topics/admin-topics.service';
import { AdminTopicVersionsController } from './topics/admin-topic-versions.controller';
import { AdminTopicVersionsService } from './topics/admin-topic-versions.service';
import { AdminBlocksController } from './blocks/admin-blocks.controller';
import { AdminBlocksService } from './blocks/admin-blocks.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminSubjectsController,
    AdminTopicsController,
    AdminTopicVersionsController,
    AdminBlocksController,
  ],
  providers: [
    AdminSubjectsService,
    AdminTopicsService,
    AdminTopicVersionsService,
    AdminBlocksService,
  ],
})
export class AdminModule {}
