/*
  Warnings:

  - You are about to drop the column `ownerId` on the `listings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "listings" DROP CONSTRAINT "listings_ownerId_fkey";

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "ownerId";
