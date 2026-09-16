/*
  Warnings:

  - A unique constraint covering the columns `[plaidTransactionId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "plaidAccessToken" TEXT,
ADD COLUMN     "plaidAccountId" TEXT,
ADD COLUMN     "plaidItemId" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "plaidTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_plaidTransactionId_key" ON "transactions"("plaidTransactionId");
