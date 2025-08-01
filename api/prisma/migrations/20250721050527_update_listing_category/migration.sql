-- AlterTable
ALTER TABLE "ListingCategory" ADD COLUMN     "formSchema" JSONB,
ADD COLUMN     "isSensitive" BOOLEAN NOT NULL DEFAULT false;
