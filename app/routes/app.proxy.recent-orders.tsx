import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

/**
 * App Proxy Endpoint for Storefront
 * 
 * This endpoint is publicly accessible from the storefront
 * URL: /apps/proxy/recent-orders?shop=example.myshopify.com
 * 
 * No authentication required - it's a public endpoint for storefront display
 */

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    // Validate shop parameter
    if (!shop) {
      return json(
        { error: "Missing shop parameter" },
        { status: 400 }
      );
    }

    console.log(`📡 App Proxy request from shop: ${shop}`);

    // Fetch recent orders for this shop
    // Only last 20 orders from last 7 days to keep it fresh
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await prisma.order.findMany({
      where: {
        shop: shop,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        shopifyOrderId: true,
        orderNumber: true,
        totalPrice: true,
        currency: true,
        customerName: true,
        createdAt: true,
      },
    });

    console.log(`✅ Returning ${orders.length} orders for storefront`);

    // Return with CORS headers for storefront access
    return json(
      {
        orders,
        lastUpdated: new Date().toISOString(),
        count: orders.length,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Cache-Control": "public, max-age=10", // Cache for 10 seconds
        },
      }
    );
  } catch (error) {
    console.error("❌ Error in app proxy endpoint:", error);
    
    return json(
      { 
        error: "Internal server error",
        orders: [], // Return empty array on error so UI doesn't break
      },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

// Handle OPTIONS request for CORS preflight
export const action = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

