-- AlterTable
ALTER TABLE "Table" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Table_deletedAt_idx" ON "Table"("deletedAt");
