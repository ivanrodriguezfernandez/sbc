/*
  Warnings:

  - You are about to drop the column `disbursed` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `disbursedAt` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "disbursed",
DROP COLUMN "disbursedAt";
