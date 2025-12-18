import type { ActionFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 WEBHOOK RECEIVED!");
  
  try {
    const body = await request.text();
    const payload = JSON.parse(body);
    
    const shop = request.headers.get("X-Shopify-Shop-Domain") || "unknown";
    
    console.log(`✅ Order webhook for shop: ${shop}`);
    console.log(`📦 Order ID: ${payload.id}`);
    console.log(`📦 Order Number: #${payload.order_number}`);
    console.log(`💰 Total: ${payload.total_price} ${payload.currency}`);
    
    // Формируем имя покупателя
    const customerName = payload.customer
      ? `${payload.customer.first_name || ""} ${payload.customer.last_name || ""}`.trim() || "Guest"
      : "Guest";
    
    console.log(`👤 Customer: ${customerName}`);
    
    // Сохраняем заказ в базу данных
    const savedOrder = await prisma.order.create({
      data: {
        shopifyOrderId: payload.id.toString(),
        orderNumber: `#${payload.order_number}`,
        shop,
        totalPrice: payload.total_price || "0.00",
        currency: payload.currency || "USD",
        customerName,
      },
    });
    
    console.log(`💾 Order saved to database with ID: ${savedOrder.id}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    
    // Если заказ уже существует (duplicate webhook), это нормально
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      console.log("⚠️  Order already exists in database (duplicate webhook - OK)");
      return new Response("Duplicate order", { status: 200 });
    }
    
    return new Response("Error", { status: 500 });
  }
};
