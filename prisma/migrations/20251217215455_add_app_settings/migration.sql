-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "position" TEXT NOT NULL DEFAULT 'bottom-left',
    "displayDuration" INTEGER NOT NULL DEFAULT 5,
    "displayInterval" INTEGER NOT NULL DEFAULT 10,
    "maxNotifications" INTEGER NOT NULL DEFAULT 10,
    "showCustomerName" BOOLEAN NOT NULL DEFAULT true,
    "showOrderNumber" BOOLEAN NOT NULL DEFAULT true,
    "showTotalPrice" BOOLEAN NOT NULL DEFAULT true,
    "showProductImage" BOOLEAN NOT NULL DEFAULT false,
    "initialDelay" INTEGER NOT NULL DEFAULT 5,
    "ordersTimeframe" INTEGER NOT NULL DEFAULT 7,
    "hideOnMobile" BOOLEAN NOT NULL DEFAULT false,
    "hideOnSpecificPages" TEXT,
    "customCSS" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_shop_key" ON "AppSettings"("shop");

-- CreateIndex
CREATE INDEX "AppSettings_shop_idx" ON "AppSettings"("shop");
