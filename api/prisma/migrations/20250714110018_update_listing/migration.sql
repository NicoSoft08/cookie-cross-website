/*
  Warnings:

  - You are about to drop the column `clicks_history` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `clicks_per_city` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `report_history` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `report_per_city` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `reportingCount` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `shares_per_city` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `views_history` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `views_per_city` on the `listings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "listings" DROP COLUMN "clicks_history",
DROP COLUMN "clicks_per_city",
DROP COLUMN "report_history",
DROP COLUMN "report_per_city",
DROP COLUMN "reportingCount",
DROP COLUMN "shares_per_city",
DROP COLUMN "views_history",
DROP COLUMN "views_per_city";
