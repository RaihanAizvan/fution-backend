import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Please configure it for Prisma.');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const js = await prisma.subject.upsert({
    where: { slug: 'javascript' },
    update: {
      title: 'JavaScript',
      orderIndex: 1,
      isActive: true,
    },
    create: {
      slug: 'javascript',
      title: 'JavaScript',
      orderIndex: 1,
    },
  });

  const functions = await prisma.topic.upsert({
    where: {
      subjectId_slug: {
        subjectId: js.id,
        slug: 'functions',
      },
    },
    update: {
      title: 'Functions',
      level: 'beginner',
      orderIndex: 2,
      isActive: true,
    },
    create: {
      subjectId: js.id,
      slug: 'functions',
      title: 'Functions',
      level: 'beginner',
      orderIndex: 2,
    },
  });

  const version = await prisma.topicVersion.upsert({
    where: {
      topicId_version: {
        topicId: functions.id,
        version: 1,
      },
    },
    update: {
      isPublished: true,
    },
    create: {
      topicId: functions.id,
      version: 1,
      isPublished: true,
    },
  });

  await prisma.block.deleteMany({
    where: {
      topicVersionId: version.id,
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
          code: 'function add(a, b) { return a + b; }',
        },
      },
      {
        topicVersionId: version.id,
        type: 'accordion',
        orderIndex: 3,
        data: {
          items: [
            {
              title: 'Arrow Functions',
              content: 'Shorter function syntax with lexical this binding.',
            },
            {
              title: 'Closures',
              content: 'Functions that capture variables from their scope.',
            },
          ],
        },
      },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
