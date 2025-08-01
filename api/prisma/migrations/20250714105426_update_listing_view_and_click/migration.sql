/*
  Warnings:

  - You are about to drop the column `clickedAt` on the `clicks` table. All the data in the column will be lost.
  - You are about to drop the column `viewedAt` on the `views` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[listingId,userId]` on the table `clicks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "views" DROP CONSTRAINT "views_userId_fkey";

-- AlterTable
ALTER TABLE "clicks" DROP COLUMN "clickedAt",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "city" DROP NOT NULL;

-- AlterTable
ALTER TABLE "views" DROP COLUMN "viewedAt",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "city" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clicks_listingId_userId_key" ON "clicks"("listingId", "userId");
