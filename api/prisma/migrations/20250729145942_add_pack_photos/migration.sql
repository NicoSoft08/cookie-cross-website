-- CreateTable
CREATE TABLE "PhotoPack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "extraImages" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 15,
    "price" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPhotoPack" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "extraImages" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingPhotoPack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ListingPhotoPack" ADD CONSTRAINT "ListingPhotoPack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPhotoPack" ADD CONSTRAINT "ListingPhotoPack_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPhotoPack" ADD CONSTRAINT "ListingPhotoPack_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PhotoPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
