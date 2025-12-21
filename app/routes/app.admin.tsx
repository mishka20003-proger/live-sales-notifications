import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Text,
  BlockStack,
  Badge,
  InlineStack,
  Box,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

type LoaderData = {
  shops: Array<{
    shop: string;
    enabled: boolean;
    dataSource: string;
    totalShows: number;
    createdAt: string;
    updatedAt: string;
    fakeInterval?: number;
    position?: string;
    size?: string;
    email?: string;
    name?: string;
  }>;
  totalShops: number;
  totalShows: number;
  activeShops: number;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Защита: только для разработчика
  // Проверяем по email разработчика из переменной окружения
  const adminEmail = process.env.ADMIN_EMAIL || "mishka20003@gmail.com";
  
  // Получаем email текущего пользователя
  const currentUserEmail = session.email || "";
  
  // Если email не совпадает - доступ запрещен
  if (currentUserEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new Response("Access denied. Only developer can access this page.", { status: 403 });
  }

  // Получаем все настройки всех магазинов
  const allSettings = await prisma.appSettings.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Получаем все сессии для информации о магазинах
  const allSessions = await prisma.session.findMany({
    select: {
      shop: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  // Объединяем данные
  const shops = allSettings.map((settings) => {
    const session = allSessions.find((s) => s.shop === settings.shop);
    return {
      shop: settings.shop,
      enabled: settings.enabled,
      dataSource: settings.dataSource,
      totalShows: settings.totalShows,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
      fakeInterval: settings.fakeInterval,
      position: settings.position,
      size: settings.size,
      email: session?.email || "N/A",
      name: session
        ? `${session.firstName || ""} ${session.lastName || ""}`.trim() || "N/A"
        : "N/A",
    };
  });

  // Статистика
  const totalShops = shops.length;
  const totalShows = shops.reduce((sum, shop) => sum + shop.totalShows, 0);
  const activeShops = shops.filter(
    (shop) => shop.enabled && shop.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  ).length;

  return json({
    shops,
    totalShops,
    totalShows,
    activeShops,
  });
};

export default function Admin() {
  const { shops, totalShops, totalShows, activeShops } = useLoaderData<typeof loader>();

  // Форматируем данные для таблицы
  const rows = shops.map((shop) => [
    shop.shop,
    shop.name,
    shop.email,
    shop.enabled ? (
      <Badge status="success">Enabled</Badge>
    ) : (
      <Badge status="critical">Disabled</Badge>
    ),
    shop.dataSource === "fake" ? (
      <Badge tone="info">Fake ({shop.fakeInterval}s)</Badge>
    ) : (
      <Badge tone="success">Real</Badge>
    ),
    shop.position || "N/A",
    shop.size || "N/A",
    shop.totalShows.toLocaleString(),
    new Date(shop.updatedAt).toLocaleDateString(),
  ]);

  return (
    <Page
      title="Admin Dashboard"
      subtitle="View all installed stores and their settings"
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Статистика */}
            <Layout>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h2">
                      Total Stores
                    </Text>
                    <Text variant="heading2xl" as="p">
                      {totalShops}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h2">
                      Active Stores
                    </Text>
                    <Text variant="heading2xl" as="p">
                      {activeShops}
                    </Text>
                    <Text variant="bodySm" tone="subdued" as="p">
                      Active in last 7 days
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h2">
                      Total Notifications
                    </Text>
                    <Text variant="heading2xl" as="p">
                      {totalShows.toLocaleString()}
                    </Text>
                    <Text variant="bodySm" tone="subdued" as="p">
                      Across all stores
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>

            {/* Таблица магазинов */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  All Stores ({totalShops})
                </Text>
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "numeric",
                    "text",
                  ]}
                  headings={[
                    "Shop",
                    "Owner Name",
                    "Email",
                    "Status",
                    "Data Source",
                    "Position",
                    "Size",
                    "Shows",
                    "Last Updated",
                  ]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

