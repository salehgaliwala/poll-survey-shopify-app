import { json } from "@remix-run/node";
import { createResponse } from "../models/response.server";

export const action = async ({ request }) => {
  const data = await request.json();

  if (!data.surveyId || !data.answers) {
    return json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  const response = await createResponse(data.surveyId, data);

  let discountCode = null;
  if (response.survey.incentiveEnabled) {
    // Logic for actual discount creation via GraphQL:
    // In production, you would use the Admin API to create a PriceRule and a DiscountCode.
    // For this demonstration, we use a placeholder that matches the merchant's intent.
    discountCode = response.survey.discountTitle || "THANKS10";
  }

  return json({
    success: true,
    discountCode
  });
};

export default function ApiSubmit() {
  return null;
}
