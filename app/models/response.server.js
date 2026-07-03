import db from "../db.server";

export async function createResponse(surveyId, data) {
  const { customerId, customerEmail, answers } = data;

  return db.response.create({
    data: {
      surveyId,
      customerId,
      customerEmail,
      answers: {
        create: answers.map((a) => ({
          questionId: a.questionId,
          value: a.value,
        })),
      },
    },
    include: {
      survey: true,
    },
  });
}

export async function getSurveyResponses(surveyId) {
  return db.response.findMany({
    where: { surveyId },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
