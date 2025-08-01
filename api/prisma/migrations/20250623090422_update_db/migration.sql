/*
  Warnings:

  - You are about to drop the column `userAgent` on the `LoginLog` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `device_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `password_reset_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `password_reset_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `verification_sessions` table. All the data in the column will be lost.
  - Added the required column `browser` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `os` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoginLog" DROP COLUMN "userAgent";

-- AlterTable
ALTER TABLE "device_sessions" DROP COLUMN "userAgent";

-- AlterTable
ALTER TABLE "password_reset_tokens" DROP COLUMN "ipAddress",
DROP COLUMN "userAgent",
ADD COLUMN     "browser" TEXT NOT NULL,
ADD COLUMN     "device" TEXT NOT NULL,
ADD COLUMN     "ip" TEXT NOT NULL,
ADD COLUMN     "os" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "verification_sessions" DROP COLUMN "userAgent";
