/*
  Warnings:

  - You are about to drop the column `bytes` on the `ad_images` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `ad_images` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `ad_images` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `ad_images` table. All the data in the column will be lost.
  - You are about to drop the column `secureUrl` on the `ad_images` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `ad_images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ad_images" DROP COLUMN "bytes",
DROP COLUMN "filename",
DROP COLUMN "format",
DROP COLUMN "height",
DROP COLUMN "secureUrl",
DROP COLUMN "width";
