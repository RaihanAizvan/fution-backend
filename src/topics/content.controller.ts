import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { TopicsService } from './topics.service';

@Controller('topics')
export class ContentController {
    constructor(private readonly topicsService: TopicsService) { }

    @Get(':slug/content')
    async getTopicContent(@Param('slug') slug: string) {
        const content = await this.topicsService.getTopicContent(slug);

        if (!content) {
            throw new NotFoundException('Topic content not found');
        }

        return content;
    }
}

