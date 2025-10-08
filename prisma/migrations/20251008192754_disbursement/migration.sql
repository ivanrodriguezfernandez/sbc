-- AlterTable
ALTER TABLE "order" ADD COLUMN     "disbursementId" TEXT;

-- CreateTable
CREATE TABLE "disbursement" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "disbursedAt" TIMESTAMPTZ(6),
    "totalGross" DECIMAL(12,2) NOT NULL,
    "totalCommission" DECIMAL(12,2) NOT NULL,
    "payout" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "disbursement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_disbursementId_fkey" FOREIGN KEY ("disbursementId") REFERENCES "disbursement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursement" ADD CONSTRAINT "disbursement_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
