import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  InlineStack,
  Badge,
  EmptyState,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

type Order = {
  id: string;
  shopifyOrderId: string;
  orderNumber: string;
  shop: string;
  totalPrice: string;
  currency: string;
  customerName: string | null;
  createdAt: string;
};

type LoaderData = {
  orders: Order[];
  lastUpdated: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const orders = await prisma.order.findMany({
    where: {
      shop: session.shop,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return json({
    orders,
    lastUpdated: new Date().toISOString(),
  });
};

export default function LiveOrders() {
  const initialData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<LoaderData>();
  const [isPolling, setIsPolling] = useState(true);

  // Используем данные из fetcher если есть, иначе из loader
  const orders = fetcher.data?.orders ?? initialData.orders;
  const lastUpdated = fetcher.data?.lastUpdated ?? initialData.lastUpdated;

  // Polling каждые 5 секунд
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      console.log("🔄 Polling for new orders...");
      fetcher.load("/app/orders/recent");
    }, 5000);

    return () => clearInterval(interval);
  }, [isPolling, fetcher]);

  // Форматирование даты/времени
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Вычисляем время с момента последнего заказа
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return `${diffSec} сек назад`;
    if (diffMin < 60) return `${diffMin} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} дн назад`;
  };

  return (
    <Page>
      <TitleBar title="Покупки в реальном времени" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Banner
              title="Live monitoring активен"
              tone="success"
              onDismiss={() => {}}
            >
              <p>
                📡 Автообновление каждые 5 секунд.{" "}
                {fetcher.state === "loading" && "🔄 Обновление..."}
              </p>
              <p style={{ fontSize: "0.85em", marginTop: "8px" }}>
                Последнее обновление: {formatDateTime(lastUpdated)}
              </p>
            </Banner>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Новые заказы ({orders.length})
                  </Text>
                  <Badge tone={isPolling ? "success" : "info"}>
                    {isPolling ? "🟢 Live" : "⏸️ Пауза"}
                  </Badge>
                </InlineStack>

                {orders.length === 0 ? (
                  <EmptyState
                    heading="Пока нет заказов"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>
                      Создайте тестовый заказ в Shopify Admin, и он появится
                      здесь в течение 5-10 секунд!
                    </p>
                  </EmptyState>
                ) : (
                  <BlockStack gap="300">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <BlockStack gap="200">
                          <InlineStack align="space-between" blockAlign="start">
                            <BlockStack gap="100">
                              <Text as="h3" variant="headingMd">
                                🛒 Заказ {order.orderNumber}
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                👤 {order.customerName || "Guest"}
                              </Text>
                            </BlockStack>
                            <Badge tone="success">
                              💰 {order.totalPrice} {order.currency}
                            </Badge>
                          </InlineStack>

                          <InlineStack gap="200" align="start">
                            <Badge tone="info">
                              🕐 {formatDateTime(order.createdAt)}
                            </Badge>
                            <Badge>{getTimeAgo(order.createdAt)}</Badge>
                          </InlineStack>
                        </BlockStack>
                      </Card>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  📊 Статистика
                </Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Всего заказов:
                    </Text>
                    <Text as="span" variant="headingMd">
                      {orders.length}
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Интервал обновления:
                    </Text>
                    <Text as="span" variant="bodyMd">
                      5 сек
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Статус:
                    </Text>
                    <Badge tone={isPolling ? "success" : "critical"}>
                      {isPolling ? "Активно" : "Остановлено"}
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  💡 Как протестировать
                </Text>
                <Text as="p" variant="bodyMd">
                  1. Создайте тестовый заказ в Shopify Admin
                </Text>
                <Text as="p" variant="bodyMd">
                  2. Заказ появится здесь через 5-10 секунд
                </Text>
                <Text as="p" variant="bodyMd">
                  3. Проверьте логи в терминале
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

