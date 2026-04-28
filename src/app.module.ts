import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [SubjectsModule, TopicsModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

