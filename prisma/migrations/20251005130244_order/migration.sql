-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "externalId" CHAR(12) NOT NULL,
    "merchantId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_merchantId_idx" ON "order"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "order_externalId_merchantId_key" ON "order"("externalId", "merchantId");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
