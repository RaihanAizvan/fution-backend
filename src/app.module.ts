import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { BlocksModule } from './blocks/blocks.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [SubjectsModule, TopicsModule, BlocksModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
