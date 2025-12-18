import { json, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Shop parameter is required" }, { status: 400 });
  }

  // Get settings for this shop
  const settings = await prisma.appSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    // Return default settings if not found
    return json({
      enabled: true,
      position: "bottom-left",
      displayDuration: 5,
      displayInterval: 10,
      maxNotifications: 10,
      dataSource: "real",
      fakeInterval: 10,
      size: "medium",
      showCustomerName: true,
      showOrderNumber: true,
      showTotalPrice: true,
      showProductImage: false,
      initialDelay: 5,
      ordersTimeframe: 7,
      hideOnMobile: false,
    });
  }

  // Return only public settings (no internal fields)
  return json({
    enabled: settings.enabled,
    position: settings.position,
    displayDuration: settings.displayDuration,
    displayInterval: settings.displayInterval,
    maxNotifications: settings.maxNotifications,
    dataSource: settings.dataSource,
    fakeInterval: settings.fakeInterval,
    size: settings.size,
    showCustomerName: settings.showCustomerName,
    showOrderNumber: settings.showOrderNumber,
    showTotalPrice: settings.showTotalPrice,
    showProductImage: settings.showProductImage,
    initialDelay: settings.initialDelay,
    ordersTimeframe: settings.ordersTimeframe,
    hideOnMobile: settings.hideOnMobile,
  });
};

