import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  console.log(`📊 Fetching recent orders for shop: ${session.shop}`);

  try {
    // Получаем последние 20 заказов для этого магазина
    const orders = await prisma.order.findMany({
      where: {
        shop: session.shop,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    console.log(`✅ Found ${orders.length} orders for ${session.shop}`);

    return json({
      orders,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return json(
      { orders: [], error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
};

