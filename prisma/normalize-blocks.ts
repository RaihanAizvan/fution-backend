import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { BlockType } from '../src/blocks/block-type.enum';
import { normalizeBlockData } from '../src/blocks/block-normalizer';
import { validateBlock } from '../src/blocks/block-validator';

const prisma = new PrismaClient();

async function main() {
  const blocks = await prisma.block.findMany({
    where: {
      type: {
        in: [BlockType.ACCORDION, BlockType.CHECKLIST, BlockType.PITFALLS],
      },
    },
    select: { id: true, type: true, data: true },
  });

  for (const block of blocks) {
    const normalizedData = normalizeBlockData(
      block.type as BlockType,
      block.data,
    );

    try {
      validateBlock(block.type as BlockType, normalizedData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid block data';
      throw new Error(`Block ${block.id} failed validation after normalization: ${message}`);
    }

    if (JSON.stringify(normalizedData) !== JSON.stringify(block.data)) {
      await prisma.block.update({
        where: { id: block.id },
        data: { data: normalizedData },
      });
    }
  }

  console.log(`Normalized ${blocks.length} list-style blocks.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
