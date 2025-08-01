/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `PhotoPack` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `PhotoPack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PhotoPack" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PhotoPack_slug_key" ON "PhotoPack"("slug");
