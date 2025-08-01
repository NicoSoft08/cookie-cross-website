/*
  Warnings:

  - You are about to drop the column `condition` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `listings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "listings" DROP COLUMN "condition",
DROP COLUMN "currency",
DROP COLUMN "description",
DROP COLUMN "price",
DROP COLUMN "title";
