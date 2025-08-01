/*
  Warnings:

  - Changed the type of `name` on the `Badge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BadgeName" AS ENUM ('verified', 'pro', 'trusted', 'top_seller', 'new');

-- AlterTable
ALTER TABLE "Badge" DROP COLUMN "name",
ADD COLUMN     "name" "BadgeName" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");
