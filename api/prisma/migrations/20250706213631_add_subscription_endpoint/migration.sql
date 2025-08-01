/*
  Warnings:

  - You are about to drop the `StoreSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StoreSubscription" DROP CONSTRAINT "StoreSubscription_storeId_fkey";

-- DropForeignKey
ALTER TABLE "StoreSubscription" DROP CONSTRAINT "StoreSubscription_userId_fkey";

-- DropTable
DROP TABLE "StoreSubscription";
