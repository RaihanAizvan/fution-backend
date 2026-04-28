/*
  Warnings:

  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `html` to the `TopicVersion` table without a default value. This is not possible if the table is not empty.
  - Made the column `markdown` on table `TopicVersion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_parentBlockId_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_topicVersionId_fkey";

-- AlterTable
UPDATE "TopicVersion" SET "markdown" = '' WHERE "markdown" IS NULL;
ALTER TABLE "TopicVersion" ADD COLUMN "html" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "markdown" SET NOT NULL;

-- Remove the default if you want it to be explicitly required in future inserts
ALTER TABLE "TopicVersion" ALTER COLUMN "html" DROP DEFAULT;

-- DropTable
DROP TABLE "Block";

