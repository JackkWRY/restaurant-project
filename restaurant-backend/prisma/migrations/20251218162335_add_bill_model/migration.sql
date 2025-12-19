-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('OPEN', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billId" TEXT;

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "status" "BillStatus" NOT NULL DEFAULT 'OPEN',
    "totalPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tableId" INTEGER NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
