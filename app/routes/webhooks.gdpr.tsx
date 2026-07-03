import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // For CUSTOMERS_DATA_REQUEST, we would typically gather data and email it or provide a URL
  // For CUSTOMERS_REDACT, we delete customer identifiable data from Responses
  // For SHOP_REDACT, we delete the Shop record and all associated surveys/responses

  switch (topic) {
    case "CUSTOMERS_REDACT":
      const customerId = payload.customer.id;
      await db.response.updateMany({
        where: { customerId: String(customerId) },
        data: { customerId: null, customerEmail: "REDACTED" }
      });
      break;
    case "SHOP_REDACT":
      await db.shop.deleteMany({ where: { shopifyDomain: shop } });
      break;
    case "CUSTOMERS_DATA_REQUEST":
      // Handle data request logic
      break;
  }

  return new Response();
};
