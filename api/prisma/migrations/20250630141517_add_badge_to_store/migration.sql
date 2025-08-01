-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "bg" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreBadge" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,

    CONSTRAINT "StoreBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StoreBadge_storeId_badgeId_key" ON "StoreBadge"("storeId", "badgeId");

-- AddForeignKey
ALTER TABLE "StoreBadge" ADD CONSTRAINT "StoreBadge_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreBadge" ADD CONSTRAINT "StoreBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
