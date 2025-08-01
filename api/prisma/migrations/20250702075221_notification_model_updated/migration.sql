/*
  Warnings:

  - You are about to drop the column `targetId` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "fk_store_notification";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "fk_user_notification";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "targetId",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "fk_user_notification" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "fk_store_notification" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
