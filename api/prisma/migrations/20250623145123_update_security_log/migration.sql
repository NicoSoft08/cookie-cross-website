/*
  Warnings:

  - You are about to drop the column `details` on the `security_logs` table. All the data in the column will be lost.
  - Added the required column `browser` to the `security_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device` to the `security_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `security_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `os` to the `security_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggeredBy` to the `security_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "security_logs" DROP COLUMN "details",
ADD COLUMN     "browser" TEXT NOT NULL,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "device" TEXT NOT NULL,
ADD COLUMN     "ip" TEXT NOT NULL,
ADD COLUMN     "os" TEXT NOT NULL,
ADD COLUMN     "triggeredBy" TEXT NOT NULL;
