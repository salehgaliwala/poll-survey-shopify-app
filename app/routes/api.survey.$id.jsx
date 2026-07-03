import { json } from "@remix-run/node";
import db from "../db.server";

export const loader = async ({ params }) => {
  const survey = await db.survey.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!survey || survey.status !== "ACTIVE") {
    return json({ error: "Survey not found or inactive" }, { status: 404 });
  }

  return json(survey, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  });
};

export default function ApiSurvey() {
  return null;
}
