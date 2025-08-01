-- AlterTable
ALTER TABLE "PhotoPack" ADD COLUMN     "color" TEXT,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "listings" INTEGER,
ADD COLUMN     "popular" BOOLEAN DEFAULT false,
ALTER COLUMN "durationDays" SET DEFAULT 15;
