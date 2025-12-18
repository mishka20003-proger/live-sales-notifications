import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { generateFakeOrder } from "../utils/fakeOrderGenerator";
import { authenticate } from "../shopify.server";

/**
 * PUBLIC API endpoint for storefront via App Proxy
 * 
 * Storefront URL: https://shop.myshopify.com/apps/proxy/recent-orders?shop=...
 * Proxied to: /proxy/recent-orders?shop=...
 * 
 * No authentication required - public endpoint
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("🌐 [App Proxy] Storefront request received");
  
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    console.error("❌ [App Proxy] Missing shop parameter");
    return json(
      { 
        error: "Shop parameter is required",
        orders: [],
        count: 0 
      },
      { 
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        }
      }
    );
  }

  try {
    console.log(`📊 [App Proxy] Fetching settings and orders for shop: ${shop}`);
    
    // Get settings to check if enabled and data source
    const settings = await prisma.appSettings.findUnique({
      where: { shop },
    });

    // If notifications are disabled, return empty array
    if (settings && !settings.enabled) {
      console.log(`⏸️  [App Proxy] Notifications disabled for shop: ${shop}`);
      return json(
        {
          orders: [],
          lastUpdated: new Date().toISOString(),
          count: 0,
          dataSource: "disabled",
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=10, s-maxage=10",
            "Content-Type": "application/json",
          },
        },
      );
    }

    const dataSource = settings?.dataSource || "real";

    // FAKE MODE: Generate fake order
    if (dataSource === "fake") {
      console.log(`🎭 [App Proxy] Generating fake order for shop: ${shop}`);
      
      const priceMin = settings?.fakePriceMin || 10;
      const priceMax = settings?.fakePriceMax || 200;
      const priceMode = settings?.fakePriceMode || 'random';
      
      let realProductPrices: number[] = [];
      
      // If real_products mode, fetch product prices from Shopify
      if (priceMode === 'real_products') {
        try {
          // Get offline session for this shop
          const session = await prisma.session.findFirst({
            where: { shop, isOnline: false },
            orderBy: { id: 'desc' },
          });
          
          if (session) {
            // Fetch products using Shopify Admin API
            const response = await fetch(
              `https://${shop}/admin/api/2024-01/products.json?limit=250&fields=variants`,
              {
                headers: {
                  'X-Shopify-Access-Token': session.accessToken,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              // Extract all variant prices
              realProductPrices = data.products
                .flatMap((product: any) => product.variants || [])
                .map((variant: any) => parseFloat(variant.price))
                .filter((price: number) => price > 0);
              
              console.log(`💰 [App Proxy] Found ${realProductPrices.length} product prices`);
            }
          }
        } catch (error) {
          console.error('❌ [App Proxy] Error fetching products:', error);
          // Fallback to random mode if error
        }
      }
      
      const fakeOrder = generateFakeOrder(
        priceMin, 
        priceMax, 
        shop,
        priceMode as 'random' | 'real_products',
        realProductPrices
      );
      
      // Increment totalShows counter (analytics)
      if (settings) {
        await prisma.appSettings.update({
          where: { shop },
          data: {
            totalShows: settings.totalShows + 1,
          },
        });
      }

      return json(
        {
          orders: [fakeOrder],
          lastUpdated: new Date().toISOString(),
          count: 1,
          dataSource: "fake",
          priceMode,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Content-Type": "application/json",
          },
        },
      );
    }

    // REAL MODE: Fetch real orders
    console.log(`📦 [App Proxy] Fetching real orders for shop: ${shop}`);
    
    const recentOrders = await prisma.order.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    console.log(`✅ [App Proxy] Found ${recentOrders.length} real orders`);

    // Increment totalShows counter if we have orders to show
    if (recentOrders.length > 0 && settings) {
      await prisma.appSettings.update({
        where: { shop },
        data: {
          totalShows: settings.totalShows + 1,
        },
      });
    }

    return json(
      {
        orders: recentOrders,
        lastUpdated: new Date().toISOString(),
        count: recentOrders.length,
        dataSource: "real",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=10, s-maxage=10",
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("❌ [App Proxy] Error fetching orders:", error);
    return json(
      { 
        error: "Error fetching orders",
        orders: [],
        count: 0
      },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        }
      }
    );
  }
};

