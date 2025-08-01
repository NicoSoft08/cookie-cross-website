/*
  Warnings:

  - A unique constraint covering the columns `[listingId,userId]` on the table `views` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "views_listingId_userId_key" ON "views"("listingId", "userId");
