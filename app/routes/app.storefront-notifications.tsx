import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  Banner,
  List,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get recent orders count for this shop
  const ordersCount = await prisma.order.count({
    where: {
      shop: session.shop,
    },
  });

  // Get last 24h orders
  const last24h = new Date();
  last24h.setHours(last24h.getHours() - 24);

  const recentOrdersCount = await prisma.order.count({
    where: {
      shop: session.shop,
      createdAt: {
        gte: last24h,
      },
    },
  });

  return json({
    shop: session.shop,
    ordersCount,
    recentOrdersCount,
    appProxyUrl: `/apps/proxy/recent-orders?shop=${session.shop}`,
  });
};

export default function StorefrontNotifications() {
  const { shop, ordersCount, recentOrdersCount, appProxyUrl } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Storefront Notifications" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Banner
                title="Purchase Notifications Live!"
                tone="success"
              >
                <p>
                  Real-time purchase notifications are now enabled for your storefront. 
                  Visitors will see recent purchases to build trust and urgency.
                </p>
              </Banner>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    📊 Statistics
                  </Text>
                  <InlineStack gap="400" align="start">
                    <div>
                      <Text as="p" variant="headingSm" tone="subdued">
                        Total Orders
                      </Text>
                      <Text as="p" variant="heading2xl">
                        {ordersCount}
                      </Text>
                    </div>
                    <div>
                      <Text as="p" variant="headingSm" tone="subdued">
                        Last 24 Hours
                      </Text>
                      <Text as="p" variant="heading2xl">
                        {recentOrdersCount}
                      </Text>
                    </div>
                  </InlineStack>
                  {recentOrdersCount === 0 && (
                    <Banner tone="warning">
                      No orders in the last 24 hours. Create a test order to see notifications!
                    </Banner>
                  )}
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    🎨 Installation Instructions
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Follow these steps to add purchase notifications to your storefront:
                  </Text>
                  
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" fontWeight="semibold">
                      Step 1: Enable the App Extension
                    </Text>
                    <List type="number">
                      <List.Item>
                        Go to your <strong>Online Store → Themes</strong>
                      </List.Item>
                      <List.Item>
                        Click <strong>Customize</strong> on your active theme
                      </List.Item>
                      <List.Item>
                        In the theme editor, click <strong>App embeds</strong> (bottom left)
                      </List.Item>
                      <List.Item>
                        Find <strong>"Purchase Notifications"</strong> and toggle it ON
                      </List.Item>
                      <List.Item>
                        Click <strong>Save</strong>
                      </List.Item>
                    </List>

                    <Divider />

                    <Text as="h3" variant="headingSm" fontWeight="semibold">
                      Step 2: Configure Settings
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      In the App embeds panel, you can customize:
                    </Text>
                    <List>
                      <List.Item>Display duration (how long notifications stay visible)</List.Item>
                      <List.Item>Interval between notifications</List.Item>
                      <List.Item>Position (bottom-left, bottom-right, top-left, top-right)</List.Item>
                      <List.Item>Maximum number of recent purchases to show</List.Item>
                    </List>

                    <Divider />

                    <Text as="h3" variant="headingSm" fontWeight="semibold">
                      Step 3: Test
                    </Text>
                    <List type="number">
                      <List.Item>
                        Visit your storefront in a new incognito window
                      </List.Item>
                      <List.Item>
                        Wait 5-10 seconds for the first notification to appear
                      </List.Item>
                      <List.Item>
                        If you have recent orders, you'll see popup notifications!
                      </List.Item>
                    </List>
                  </BlockStack>

                  <InlineStack gap="200">
                    <Button
                      url={`https://${shop}/admin/themes/current/editor`}
                      target="_blank"
                      variant="primary"
                    >
                      Open Theme Editor
                    </Button>
                    <Button
                      url={`https://${shop}`}
                      target="_blank"
                    >
                      View Storefront
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    🔧 Technical Details
                  </Text>
                  
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      <strong>Shop:</strong> {shop}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>API Endpoint:</strong> <code>{appProxyUrl}</code>
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>Update Frequency:</strong> Every 15 seconds
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>Data Source:</strong> Last 7 days of orders (up to 20 most recent)
                    </Text>
                  </BlockStack>

                  <Banner>
                    <p>
                      <strong>Privacy Note:</strong> Only shows order number and total amount. 
                      Customer names are displayed as provided in the order (can be "Guest" for 
                      guest checkouts).
                    </p>
                  </Banner>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    📋 Troubleshooting
                  </Text>
                  
                  <BlockStack gap="300">
                    <div>
                      <Text as="p" variant="headingSm" fontWeight="semibold">
                        Notifications not showing?
                      </Text>
                      <List>
                        <List.Item>Check that the App embed is enabled in Theme Customizer</List.Item>
                        <List.Item>Ensure you have at least one order in the last 7 days</List.Item>
                        <List.Item>Try clearing your browser cache or using incognito mode</List.Item>
                        <List.Item>Check browser console for any JavaScript errors</List.Item>
                      </List>
                    </div>

                    <div>
                      <Text as="p" variant="headingSm" fontWeight="semibold">
                        Want to disable notifications temporarily?
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Go to Theme Customizer → App embeds → Toggle OFF "Purchase Notifications"
                      </Text>
                    </div>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    🎯 Quick Links
                  </Text>
                  <BlockStack gap="100">
                    <Button
                      url="/app/live-orders"
                      fullWidth
                    >
                      View Live Orders (Admin)
                    </Button>
                    <Button
                      url={`https://${shop}/admin/themes/current/editor`}
                      target="_blank"
                      fullWidth
                    >
                      Theme Customizer
                    </Button>
                    <Button
                      url={appProxyUrl}
                      target="_blank"
                      fullWidth
                    >
                      Test API Endpoint
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h3" variant="headingMd">
                      Status
                    </Text>
                    <Badge tone="success">Active</Badge>
                  </InlineStack>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Storefront notifications are configured and ready to use.
                  </Text>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    💡 Pro Tips
                  </Text>
                  <List>
                    <List.Item>Position notifications where they don't block important content</List.Item>
                    <List.Item>Keep display duration at 5-7 seconds for best results</List.Item>
                    <List.Item>Test on mobile - notifications are responsive</List.Item>
                    <List.Item>Monitor how notifications affect conversion rates</List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

