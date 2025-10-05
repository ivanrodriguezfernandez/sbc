/*
  Warnings:

  - A unique constraint covering the columns `[id,reference,email]` on the table `merchant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."merchant_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "merchant_id_reference_email_key" ON "merchant"("id", "reference", "email");
