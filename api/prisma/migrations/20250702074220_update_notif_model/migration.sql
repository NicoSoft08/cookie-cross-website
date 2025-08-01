/*
  Warnings:

  - You are about to drop the column `store_id` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "store_id",
ADD COLUMN     "storeId" TEXT;
