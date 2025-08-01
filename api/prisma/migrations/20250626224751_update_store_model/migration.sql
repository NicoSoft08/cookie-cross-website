/*
  Warnings:

  - You are about to drop the column `address` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Store` table. All the data in the column will be lost.
  - Added the required column `category` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
