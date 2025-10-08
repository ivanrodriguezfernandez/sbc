-- AlterTable
ALTER TABLE "order" ADD COLUMN     "disbursed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disbursedAt" TIMESTAMPTZ(6);
