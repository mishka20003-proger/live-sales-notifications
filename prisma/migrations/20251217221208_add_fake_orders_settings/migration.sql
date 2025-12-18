-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "position" TEXT NOT NULL DEFAULT 'bottom-left',
    "displayDuration" INTEGER NOT NULL DEFAULT 5,
    "displayInterval" INTEGER NOT NULL DEFAULT 10,
    "maxNotifications" INTEGER NOT NULL DEFAULT 10,
    "dataSource" TEXT NOT NULL DEFAULT 'real',
    "fakeInterval" INTEGER NOT NULL DEFAULT 10,
    "fakePriceMin" REAL NOT NULL DEFAULT 10.0,
    "fakePriceMax" REAL NOT NULL DEFAULT 200.0,
    "size" TEXT NOT NULL DEFAULT 'medium',
    "showCustomerName" BOOLEAN NOT NULL DEFAULT true,
    "showOrderNumber" BOOLEAN NOT NULL DEFAULT true,
    "showTotalPrice" BOOLEAN NOT NULL DEFAULT true,
    "showProductImage" BOOLEAN NOT NULL DEFAULT false,
    "initialDelay" INTEGER NOT NULL DEFAULT 5,
    "ordersTimeframe" INTEGER NOT NULL DEFAULT 7,
    "hideOnMobile" BOOLEAN NOT NULL DEFAULT false,
    "hideOnSpecificPages" TEXT,
    "customCSS" TEXT,
    "totalShows" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AppSettings" ("createdAt", "customCSS", "displayDuration", "displayInterval", "enabled", "hideOnMobile", "hideOnSpecificPages", "id", "initialDelay", "maxNotifications", "ordersTimeframe", "position", "shop", "showCustomerName", "showOrderNumber", "showProductImage", "showTotalPrice", "updatedAt") SELECT "createdAt", "customCSS", "displayDuration", "displayInterval", "enabled", "hideOnMobile", "hideOnSpecificPages", "id", "initialDelay", "maxNotifications", "ordersTimeframe", "position", "shop", "showCustomerName", "showOrderNumber", "showProductImage", "showTotalPrice", "updatedAt" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
CREATE UNIQUE INDEX "AppSettings_shop_key" ON "AppSettings"("shop");
CREATE INDEX "AppSettings_shop_idx" ON "AppSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
