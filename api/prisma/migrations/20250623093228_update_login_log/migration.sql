/*
  Warnings:

  - A unique constraint covering the columns `[userId,ip,browser,os,device]` on the table `LoginLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LoginLog_userId_ip_browser_os_device_key" ON "LoginLog"("userId", "ip", "browser", "os", "device");
