/*
  Warnings:

  - A unique constraint covering the columns `[name,deletedAt]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Table_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Table_name_deletedAt_key" ON "Table"("name", "deletedAt");
