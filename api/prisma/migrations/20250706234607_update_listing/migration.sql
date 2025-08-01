-- CreateEnum
CREATE TYPE "ListingAudience" AS ENUM ('ONLY_ME', 'PUBLIC', 'FOLLOWERS');

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "audience" "ListingAudience" NOT NULL DEFAULT 'PUBLIC';
