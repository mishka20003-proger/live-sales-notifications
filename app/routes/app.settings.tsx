import { useEffect, useState } from "react";
import { useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Button,
  BlockStack,
  InlineStack,
  Banner,
  Text,
  Divider,
  Box,
  RadioButton,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  position: "bottom-left",
  displayDuration: 5,
  displayInterval: 10,
  maxNotifications: 10,
  dataSource: "real",
  fakeInterval: 10,
  fakePriceMin: 10.0,
  fakePriceMax: 200.0,
  fakePriceMode: "random",
  size: "medium",
  showCustomerName: true,
  showOrderNumber: true,
  showTotalPrice: true,
  showProductImage: false,
  initialDelay: 5,
  ordersTimeframe: 7,
  hideOnMobile: false,
  totalShows: 0,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get or create settings for this shop
  let settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        shop: session.shop,
        ...DEFAULT_SETTINGS,
      },
    });
  }

  return json({ settings });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const settingsData = {
    enabled: formData.get("enabled") === "true",
    position: formData.get("position") as string,
    displayDuration: parseInt(formData.get("displayDuration") as string),
    displayInterval: parseInt(formData.get("displayInterval") as string),
    maxNotifications: parseInt(formData.get("maxNotifications") as string),
    dataSource: formData.get("dataSource") as string,
    fakeInterval: parseInt(formData.get("fakeInterval") as string),
    fakePriceMin: parseFloat(formData.get("fakePriceMin") as string),
    fakePriceMax: parseFloat(formData.get("fakePriceMax") as string),
    fakePriceMode: formData.get("fakePriceMode") as string,
    size: formData.get("size") as string,
    showCustomerName: formData.get("showCustomerName") === "true",
    showOrderNumber: formData.get("showOrderNumber") === "true",
    showTotalPrice: formData.get("showTotalPrice") === "true",
    showProductImage: formData.get("showProductImage") === "true",
    initialDelay: parseInt(formData.get("initialDelay") as string),
    ordersTimeframe: parseInt(formData.get("ordersTimeframe") as string),
    hideOnMobile: formData.get("hideOnMobile") === "true",
  };

  await prisma.appSettings.upsert({
    where: { shop: session.shop },
    update: settingsData,
    create: {
      shop: session.shop,
      ...settingsData,
    },
  });

  return json({ success: true, message: "Settings saved successfully!" });
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const shopify = useAppBridge();

  const isLoading = navigation.state === "submitting";

  // Form state
  const [enabled, setEnabled] = useState(settings.enabled);
  const [position, setPosition] = useState(settings.position);
  const [displayDuration, setDisplayDuration] = useState(settings.displayDuration.toString());
  const [displayInterval, setDisplayInterval] = useState(settings.displayInterval.toString());
  const [maxNotifications, setMaxNotifications] = useState(settings.maxNotifications.toString());
  const [dataSource, setDataSource] = useState(settings.dataSource);
  const [fakeInterval, setFakeInterval] = useState(settings.fakeInterval.toString());
  const [fakePriceMin, setFakePriceMin] = useState(settings.fakePriceMin.toString());
  const [fakePriceMax, setFakePriceMax] = useState(settings.fakePriceMax.toString());
  const [fakePriceMode, setFakePriceMode] = useState(settings.fakePriceMode || "random");
  const [size, setSize] = useState(settings.size);
  const [showCustomerName, setShowCustomerName] = useState(settings.showCustomerName);
  const [showOrderNumber, setShowOrderNumber] = useState(settings.showOrderNumber);
  const [showTotalPrice, setShowTotalPrice] = useState(settings.showTotalPrice);
  const [showProductImage, setShowProductImage] = useState(settings.showProductImage);
  const [initialDelay, setInitialDelay] = useState(settings.initialDelay.toString());
  const [ordersTimeframe, setOrdersTimeframe] = useState(settings.ordersTimeframe.toString());
  const [hideOnMobile, setHideOnMobile] = useState(settings.hideOnMobile);

  // Show success toast
  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Settings saved successfully!");
    }
  }, [actionData, shopify]);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("enabled", enabled.toString());
    formData.append("position", position);
    formData.append("displayDuration", displayDuration);
    formData.append("displayInterval", displayInterval);
    formData.append("maxNotifications", maxNotifications);
    formData.append("dataSource", dataSource);
    formData.append("fakeInterval", fakeInterval);
    formData.append("fakePriceMin", fakePriceMin);
    formData.append("fakePriceMax", fakePriceMax);
    formData.append("fakePriceMode", fakePriceMode);
    formData.append("size", size);
    formData.append("showCustomerName", showCustomerName.toString());
    formData.append("showOrderNumber", showOrderNumber.toString());
    formData.append("showTotalPrice", showTotalPrice.toString());
    formData.append("showProductImage", showProductImage.toString());
    formData.append("initialDelay", initialDelay);
    formData.append("ordersTimeframe", ordersTimeframe);
    formData.append("hideOnMobile", hideOnMobile.toString());

    submit(formData, { method: "post" });
  };

  const positionOptions = [
    { label: "Bottom Left", value: "bottom-left" },
    { label: "Bottom Right", value: "bottom-right" },
    { label: "Top Center", value: "top-center" },
  ];

  const dataSourceOptions = [
    { label: "Real Orders (from your store)", value: "real" },
    { label: "Fake Orders (generated demo data)", value: "fake" },
  ];

  const sizeOptions = [
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
  ];

  const fakeIntervalOptions = [
    { label: "5 seconds", value: "5" },
    { label: "10 seconds", value: "10" },
    { label: "15 seconds", value: "15" },
    { label: "30 seconds", value: "30" },
  ];

  return (
    <Page>
      <TitleBar title="Settings" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              {!enabled && (
                <Banner tone="warning">
                  <p>
                    Notifications are currently <strong>disabled</strong>. Enable them below to
                    show purchase notifications on your storefront.
                  </p>
                </Banner>
              )}

              {actionData?.success && (
                <Banner tone="success" onDismiss={() => {}}>
                  <p>{actionData.message}</p>
                </Banner>
              )}

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    General Settings
                  </Text>

                  <Checkbox
                    label="Enable purchase notifications"
                    checked={enabled}
                    onChange={setEnabled}
                    helpText="Show real-time purchase notifications on your storefront"
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Data Source
                  </Text>

                  <Select
                    label="Order source"
                    options={dataSourceOptions}
                    value={dataSource}
                    onChange={setDataSource}
                    disabled={!enabled}
                    helpText="Choose between real orders from your store or generated fake orders for testing"
                  />

                  {dataSource === "fake" && (
                    <>
                      <Divider />
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Fake orders are randomly generated for demo purposes. Configure the behavior below:
                      </Text>

                      <Select
                        label="Show notification every"
                        options={fakeIntervalOptions}
                        value={fakeInterval}
                        onChange={setFakeInterval}
                        disabled={!enabled}
                      />

                      <Divider />
                      
                      <BlockStack gap="300">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Price Generation Mode
                        </Text>
                        
                        <RadioButton
                          label="Random prices in range"
                          helpText="Generate random prices between min and max values"
                          checked={fakePriceMode === "random"}
                          id="random"
                          name="fakePriceMode"
                          onChange={() => setFakePriceMode("random")}
                          disabled={!enabled}
                        />
                        
                        {fakePriceMode === "random" && (
                          <InlineStack gap="400">
                            <div style={{ flex: 1 }}>
                              <TextField
                                label="Minimum price"
                                type="number"
                                value={fakePriceMin}
                                onChange={setFakePriceMin}
                                prefix="$"
                                autoComplete="off"
                                disabled={!enabled}
                                min="1"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <TextField
                                label="Maximum price"
                                type="number"
                                value={fakePriceMax}
                                onChange={setFakePriceMax}
                                prefix="$"
                                autoComplete="off"
                                disabled={!enabled}
                                min="1"
                              />
                            </div>
                          </InlineStack>
                        )}
                        
                        <RadioButton
                          label="Use real product prices"
                          helpText="Generate realistic order totals based on actual products in your store (e.g., $15, $30, $45 if products cost $15 and $30)"
                          checked={fakePriceMode === "real_products"}
                          id="real_products"
                          name="fakePriceMode"
                          onChange={() => setFakePriceMode("real_products")}
                          disabled={!enabled}
                        />
                        
                        {fakePriceMode === "real_products" && (
                          <Banner tone="info">
                            <p>
                              <strong>Realistic pricing mode:</strong> Orders will show totals that match combinations of your actual product prices.
                              For example, if you have products at $15 and $30, notifications will show $15, $30, $45 (1+1), $60 (2×1), etc.
                            </p>
                          </Banner>
                        )}
                      </BlockStack>

                      <Divider />

                      <Banner tone="info">
                        <p>
                          <strong>Customer names:</strong> Generated in format "FirstName L." (e.g., "Anna J.") using English names only.
                          <br />
                          <strong>Products:</strong> Random product names from preset list.
                        </p>
                      </Banner>
                    </>
                  )}
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Appearance
                  </Text>

                  <Select
                    label="Notification size"
                    options={sizeOptions}
                    value={size}
                    onChange={setSize}
                    disabled={!enabled}
                    helpText="Choose the size of notification popups"
                  />

                  <Select
                    label="Notification position"
                    options={positionOptions}
                    value={position}
                    onChange={setPosition}
                    disabled={!enabled}
                    helpText="Where notifications appear on the screen"
                  />

                  <TextField
                    label="Display duration"
                    type="number"
                    value={displayDuration}
                    onChange={setDisplayDuration}
                    suffix="seconds"
                    helpText="How long each notification stays visible"
                    autoComplete="off"
                    disabled={!enabled}
                    min="3"
                    max="15"
                  />

                  <TextField
                    label="Display interval"
                    type="number"
                    value={displayInterval}
                    onChange={setDisplayInterval}
                    suffix="seconds"
                    helpText="Time between showing notifications"
                    autoComplete="off"
                    disabled={!enabled}
                    min="5"
                    max="60"
                  />

                  <TextField
                    label="Initial delay"
                    type="number"
                    value={initialDelay}
                    onChange={setInitialDelay}
                    suffix="seconds"
                    helpText="Wait time before showing the first notification"
                    autoComplete="off"
                    disabled={!enabled}
                    min="0"
                    max="30"
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Display Options
                  </Text>

                  <Checkbox
                    label="Show customer name"
                    checked={showCustomerName}
                    onChange={setShowCustomerName}
                    disabled={!enabled}
                  />

                  <Checkbox
                    label="Show order number"
                    checked={showOrderNumber}
                    onChange={setShowOrderNumber}
                    disabled={!enabled}
                  />

                  <Checkbox
                    label="Show total price"
                    checked={showTotalPrice}
                    onChange={setShowTotalPrice}
                    disabled={!enabled}
                  />

                  <Checkbox
                    label="Show product image"
                    checked={showProductImage}
                    onChange={setShowProductImage}
                    disabled={!enabled}
                    helpText="Coming soon: Display product images in notifications"
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Advanced Settings
                  </Text>

                  <TextField
                    label="Maximum notifications per session"
                    type="number"
                    value={maxNotifications}
                    onChange={setMaxNotifications}
                    helpText="Limit how many notifications a visitor sees"
                    autoComplete="off"
                    disabled={!enabled}
                    min="1"
                    max="50"
                  />

                  <TextField
                    label="Orders timeframe"
                    type="number"
                    value={ordersTimeframe}
                    onChange={setOrdersTimeframe}
                    suffix="days"
                    helpText="Show orders from the last X days"
                    autoComplete="off"
                    disabled={!enabled}
                    min="1"
                    max="30"
                  />

                  <Checkbox
                    label="Hide on mobile devices"
                    checked={hideOnMobile}
                    onChange={setHideOnMobile}
                    disabled={!enabled}
                    helpText="Don't show notifications on mobile screens"
                  />
                </BlockStack>
              </Card>

              <Box>
                <InlineStack align="end" gap="200">
                  <Button onClick={handleSubmit} variant="primary" loading={isLoading}>
                    Save settings
                  </Button>
                </InlineStack>
              </Box>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    💡 Quick Tips
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    • Position notifications where they won't block important content
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    • 5-7 seconds display duration works best
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    • Test on both desktop and mobile
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    • Monitor conversion rate changes
                  </Text>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    📊 Current Status
                  </Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="p" variant="bodyMd">
                      Notifications:
                    </Text>
                    <Text as="p" variant="bodyMd" fontWeight="semibold" tone={enabled ? "success" : "subdued"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="p" variant="bodyMd">
                      Data Source:
                    </Text>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {dataSource === "real" ? "Real Orders" : "Fake Orders"}
                    </Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="p" variant="bodyMd">
                      Position:
                    </Text>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {position.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="p" variant="bodyMd">
                      Total Shows:
                    </Text>
                    <Text as="p" variant="bodyMd" fontWeight="semibold" tone="magic">
                      {settings.totalShows.toLocaleString()}
                    </Text>
                  </InlineStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    🔗 Related Pages
                  </Text>
                  <Button url="/app/storefront-notifications" fullWidth>
                    Installation Guide
                  </Button>
                  <Button url="/app/live-orders" fullWidth>
                    Live Orders Monitor
                  </Button>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

