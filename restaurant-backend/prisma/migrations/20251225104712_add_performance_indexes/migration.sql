-- CreateIndex
CREATE INDEX "Menu_deletedAt_idx" ON "Menu"("deletedAt");

-- CreateIndex
CREATE INDEX "Menu_isVisible_isAvailable_idx" ON "Menu"("isVisible", "isAvailable");

-- CreateIndex
CREATE INDEX "Order_tableId_status_idx" ON "Order"("tableId", "status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "Table_isAvailable_idx" ON "Table"("isAvailable");

-- CreateIndex
CREATE INDEX "Table_isOccupied_idx" ON "Table"("isOccupied");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
