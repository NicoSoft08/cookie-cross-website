/*
  Warnings:

  - You are about to drop the column `categoryId` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `listings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parentId_fkey";

-- DropForeignKey
ALTER TABLE "listings" DROP CONSTRAINT "listings_categoryId_fkey";

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "categoryId",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "subcategory" TEXT;

-- DropTable
DROP TABLE "categories";
