-- CreateEnum
CREATE TYPE "disbursementFrequencyType" AS ENUM ('WEEKLY', 'DAILY');

-- CreateTable
CREATE TABLE "merchant" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "liveOn" TIMESTAMP(3) NOT NULL,
    "disbursementFrequency" "disbursementFrequencyType" NOT NULL,
    "minimumMonthlyFee" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "merchant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchant_email_key" ON "merchant"("email");
