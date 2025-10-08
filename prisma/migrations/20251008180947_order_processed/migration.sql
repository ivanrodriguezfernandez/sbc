-- AlterTable
ALTER TABLE "order" ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processedAt" TIMESTAMPTZ(6);
