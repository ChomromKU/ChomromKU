/*
  Warnings:

  - You are about to drop the column `twitter` on the `social_media` table. All the data in the column will be lost.
  - Added the required column `line` to the `social_media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `social_media` DROP COLUMN `twitter`,
    ADD COLUMN `line` VARCHAR(255) NOT NULL;
