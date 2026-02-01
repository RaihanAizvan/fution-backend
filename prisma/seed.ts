import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const js = await prisma.subject.create({
    data: {
      slug: 'javascript',
      title: 'JavaScript',
      orderIndex: 1,
    },
  });

  const functions = await prisma.topic.create({
    data: {
      subjectId: js.id,
      slug: 'functions',
      title: 'Functions',
      level: 'beginner',
      orderIndex: 2,
    },
  });

  const version = await prisma.topicVersion.create({
    data: {
      topicId: functions.id,
      version: 1,
      isPublished: true,
    },
  });

  await prisma.block.createMany({
    data: [
      {
        topicVersionId: version.id,
        type: 'intro',
        orderIndex: 1,
        data: {
          title: 'Functions',
          description: 'Reusable blocks of logic.',
        },
      },
      {
        topicVersionId: version.id,
        type: 'code',
        orderIndex: 2,
        data: {
          language: 'javascript',
          code: 'function add(a,b){ return a+b }',
        },
      },
    ],
  });
}

main();
