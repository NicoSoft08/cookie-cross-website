/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `clicks` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `shares` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `views` table. All the data in the column will be lost.
  - Added the required column `city` to the `clicks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `views` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clicks" DROP COLUMN "ipAddress",
ADD COLUMN     "city" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "shares" DROP COLUMN "platform";

-- AlterTable
ALTER TABLE "views" DROP COLUMN "ipAddress",
ADD COLUMN     "city" TEXT NOT NULL;
