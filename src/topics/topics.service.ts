import { Injectable } from '@nestjs/common';

@Injectable()
export class TopicsService {
  getTopicsBySubject(subjectSlug: string) {
    if (subjectSlug === 'javascript') {
      return [
        { slug: 'variables', title: 'Variables', order: 1 },
        { slug: 'functions', title: 'Functions', order: 2 },
        { slug: 'closures', title: 'Closures', order: 3 }
      ]
    }

    if (subjectSlug === 'mongodb') {
      return [
        { slug: 'collections', title: 'Collections', order: 1 },
        { slug: 'documents', title: 'Documents', order: 2 },
        { slug: 'aggregation', title: 'Aggregation', order: 3 }
      ]
    }

    return []
  }
}

