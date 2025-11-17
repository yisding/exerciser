-- CreateTable
CREATE TABLE "Studio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "websiteUrl" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessClass" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "capacity" INTEGER,
    "spotsAvailable" INTEGER,
    "level" TEXT,
    "description" TEXT,
    "bookingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitnessClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "classCount" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorDetails" TEXT,

    CONSTRAINT "ScrapeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Studio_brand_idx" ON "Studio"("brand");

-- CreateIndex
CREATE INDEX "Studio_location_idx" ON "Studio"("location");

-- CreateIndex
CREATE INDEX "FitnessClass_studioId_idx" ON "FitnessClass"("studioId");

-- CreateIndex
CREATE INDEX "FitnessClass_startTime_idx" ON "FitnessClass"("startTime");

-- CreateIndex
CREATE INDEX "FitnessClass_className_idx" ON "FitnessClass"("className");

-- CreateIndex
CREATE INDEX "ScrapeLog_brand_idx" ON "ScrapeLog"("brand");

-- CreateIndex
CREATE INDEX "ScrapeLog_startedAt_idx" ON "ScrapeLog"("startedAt");

-- AddForeignKey
ALTER TABLE "FitnessClass" ADD CONSTRAINT "FitnessClass_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
