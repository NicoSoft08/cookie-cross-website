/*
  Warnings:

  - You are about to drop the column `subscription` on the `PushSubscription` table. All the data in the column will be lost.
  - Added the required column `auth` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endpoint` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `p256dh` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "subscription",
ADD COLUMN     "auth" TEXT NOT NULL,
ADD COLUMN     "endpoint" TEXT NOT NULL,
ADD COLUMN     "expirationTime" TIMESTAMP(3),
ADD COLUMN     "p256dh" TEXT NOT NULL;
