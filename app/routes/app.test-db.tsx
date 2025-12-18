import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  try {
    const count = await prisma.order.count();
    return json({ success: true, count, error: null });
  } catch (error) {
    return json({ 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export default function TestDb() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page title="Database Test">
      <Card>
        <Text as="p">
          {data.success 
            ? `✅ Database works! Orders count: ${data.count}`
            : `❌ Error: ${data.error}`
          }
        </Text>
      </Card>
    </Page>
  );
}

