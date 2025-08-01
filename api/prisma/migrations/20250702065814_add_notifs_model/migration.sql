-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('USER', 'STORE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ACCOUNT_INACTIVE', 'EMAIL_UNVERIFIED', 'STORE_PENDING', 'STORE_APPROVED', 'STORE_REJECTED', 'NEW_SUBSCRIBER', 'NEW_LISTING', 'LISTING_DELETED');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "fk_user_notification" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "fk_store_notification" FOREIGN KEY ("targetId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
