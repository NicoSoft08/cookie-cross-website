-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "isSold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSponsored" BOOLEAN NOT NULL DEFAULT false;
