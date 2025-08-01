/*
  Warnings:

  - You are about to drop the column `isGenderPublic` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "GenderVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isGenderPublic",
ADD COLUMN     "genderVisibility" "GenderVisibility" NOT NULL DEFAULT 'PRIVATE';
