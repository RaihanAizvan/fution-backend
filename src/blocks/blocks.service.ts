import { Injectable } from '@nestjs/common';

@Injectable()
export class BlocksService {
  getBlocksByTopic(topicSlug: string) {
    if (topicSlug === 'functions') {
      return {
        topic: {
          slug: 'functions',
          title: 'Functions'
        },
        blocks: [
          {
            type: 'intro',
            data: {
              title: 'Functions',
              description:
                'Functions are reusable blocks of logic used to perform a task.'
            }
          },
          {
            type: 'section',
            data: {
              title: 'Types of Functions'
            }
          },
          {
            type: 'accordion',
            data: {
              items: [
                {
                  title: 'Function Declaration',
                  content: 'Standard way to define a function.'
                },
                {
                  title: 'Arrow Function',
                  content:
                    'A shorter syntax with lexical this binding.'
                },
                {
                  title: 'Pure Function',
                  content:
                    'Functions that do not produce side effects.'
                }
              ]
            }
          },
          {
            type: 'code',
            data: {
              language: 'javascript',
              code:
                'function add(a, b) {\n  return a + b;\n}'
            }
          },
          {
            type: 'reference',
            data: {
              title: 'MDN – Functions',
              url:
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions'
            }
          }
        ]
      }
    }

    return {
      topic: { slug: topicSlug },
      blocks: []
    }
  }
}

