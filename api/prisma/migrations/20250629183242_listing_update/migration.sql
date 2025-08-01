/*
  Warnings:

  - You are about to drop the column `publicId` on the `ad_images` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ad_images_publicId_key";

-- AlterTable
ALTER TABLE "ad_images" DROP COLUMN "publicId";
