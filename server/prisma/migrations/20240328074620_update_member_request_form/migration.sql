-- DropIndex
DROP INDEX `MemberRequestForm_clubId_key` ON `MemberRequestForm`;

-- AlterTable
ALTER TABLE `events` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `posts` ALTER COLUMN `updated_at` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `MemberRequestForm_clubId_idx` ON `MemberRequestForm`(`clubId`);
