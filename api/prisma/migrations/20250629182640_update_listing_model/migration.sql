-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "searchableTerms" JSONB NOT NULL DEFAULT '{}';
