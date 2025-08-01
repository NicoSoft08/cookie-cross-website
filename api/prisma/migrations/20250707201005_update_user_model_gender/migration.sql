-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isGenderPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneNumberVerified" BOOLEAN NOT NULL DEFAULT false;
