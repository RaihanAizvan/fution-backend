-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_parentBlockId_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_topicVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "TopicVersion" DROP CONSTRAINT "TopicVersion_topicId_fkey";

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVersion" ADD CONSTRAINT "TopicVersion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_topicVersionId_fkey" FOREIGN KEY ("topicVersionId") REFERENCES "TopicVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_parentBlockId_fkey" FOREIGN KEY ("parentBlockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
