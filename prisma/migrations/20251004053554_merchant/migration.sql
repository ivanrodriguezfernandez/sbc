-- CreateEnum
CREATE TYPE "disbursementFrequencyType" AS ENUM ('WEEKLY', 'DAILY');

-- CreateTable
CREATE TABLE "merchant" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "live_on" TIMESTAMP(3) NOT NULL,
    "disbursement_frequency" "disbursementFrequencyType" NOT NULL,
    "minimum_monthly_fee" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "merchant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchant_email_key" ON "merchant"("email");
