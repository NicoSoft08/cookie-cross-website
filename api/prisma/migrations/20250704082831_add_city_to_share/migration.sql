/*
  Warnings:

  - Added the required column `city` to the `shares` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shares" ADD COLUMN     "city" TEXT NOT NULL;
