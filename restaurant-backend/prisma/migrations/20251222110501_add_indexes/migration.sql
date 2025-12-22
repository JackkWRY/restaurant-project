-- CreateIndex
CREATE INDEX "Bill_status_idx" ON "Bill"("status");

-- CreateIndex
CREATE INDEX "Bill_closedAt_idx" ON "Bill"("closedAt");

-- CreateIndex
CREATE INDEX "Bill_tableId_idx" ON "Bill"("tableId");

-- CreateIndex
CREATE INDEX "Menu_categoryId_idx" ON "Menu"("categoryId");

-- CreateIndex
CREATE INDEX "Menu_isRecommended_idx" ON "Menu"("isRecommended");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_tableId_idx" ON "Order"("tableId");

-- CreateIndex
CREATE INDEX "Order_billId_idx" ON "Order"("billId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_menuId_idx" ON "OrderItem"("menuId");

-- CreateIndex
CREATE INDEX "OrderItem_status_idx" ON "OrderItem"("status");
