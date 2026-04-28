import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { renderMarkdownToHtml } from '../src/utils/markdown-renderer.util';

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

  const functionsMarkdown = '# Functions\n\nReusable blocks of logic.\n\n```javascript\nfunction add(a, b) {\n  return a + b;\n}\n```\n';
  const functionsHtml = await renderMarkdownToHtml(functionsMarkdown);

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

  await prisma.topicVersion.upsert({
    where: {
      topicId_version: {
        topicId: functions.id,
        version: 1,
      },
    },
    update: {
      isPublished: true,
      markdown: functionsMarkdown,
      html: functionsHtml,
    },
    create: {
      topicId: functions.id,
      version: 1,
      isPublished: true,
      markdown: functionsMarkdown,
      html: functionsHtml,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

