/*
  Warnings:

  - You are about to drop the column `sharedAt` on the `shares` table. All the data in the column will be lost.
  - You are about to drop the `favorites` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[listingId,userId]` on the table `shares` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_listingId_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_userId_fkey";

-- DropForeignKey
ALTER TABLE "shares" DROP CONSTRAINT "shares_userId_fkey";

-- AlterTable
ALTER TABLE "shares" DROP COLUMN "sharedAt",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL;

-- DropTable
DROP TABLE "favorites";

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "likes_listingId_userId_key" ON "likes"("listingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "shares_listingId_userId_key" ON "shares"("listingId", "userId");

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
