/*
  Warnings:

  - You are about to drop the `LoginLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,ip,browser,os,device]` on the table `device_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "LoginLog" DROP CONSTRAINT "LoginLog_userId_fkey";

-- DropTable
DROP TABLE "LoginLog";

-- CreateTable
CREATE TABLE "login_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "country" TEXT,
    "city" TEXT,
    "status" "LoginStatus" NOT NULL DEFAULT 'SUCCESS',
    "reason" TEXT,
    "ip" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "isMobile" BOOLEAN NOT NULL DEFAULT false,
    "isTablet" BOOLEAN NOT NULL DEFAULT false,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_sessions_userId_ip_browser_os_device_key" ON "device_sessions"("userId", "ip", "browser", "os", "device");

-- AddForeignKey
ALTER TABLE "login_log" ADD CONSTRAINT "login_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
