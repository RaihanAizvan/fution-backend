import { AdminMiddleware } from './admin.middleware';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminSubjectsController } from './subjects/admin-subjects.controller';
import { AdminSubjectsService } from './subjects/admin-subjects.service';
import { AdminTopicsController } from './topics/admin-topics.controller';
import { AdminTopicsRootController } from './topics/admin-topics-root.controller';
import { AdminTopicsService } from './topics/admin-topics.service';
import { AdminTopicVersionsController } from './topics/admin-topic-versions.controller';
import { AdminTopicVersionsService } from './topics/admin-topic-versions.service';
import { AdminAuthController } from './auth/admin-auth.controller';
import { AdminAuthService } from './auth/admin-auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminSubjectsController,
    AdminTopicsController,
    AdminTopicsRootController,
    AdminTopicVersionsController,
  ],
  providers: [
    AdminAuthService,
    AdminSubjectsService,
    AdminTopicsService,
    AdminTopicVersionsService,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminMiddleware)
      .exclude(
        { path: 'admin/auth/login', method: RequestMethod.POST },
        { path: 'admin/auth/request', method: RequestMethod.POST },
      )
      .forRoutes(
        AdminSubjectsController,
        AdminTopicsController,
        AdminTopicsRootController,
        AdminTopicVersionsController,
        AdminAuthController,
      );
  }
}

