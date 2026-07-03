import db from "../db.server";

export async function getSurveys(shop) {
  const shopRecord = await db.shop.findUnique({
    where: { shopifyDomain: shop },
  });

  if (!shopRecord) return [];

  return db.survey.findMany({
    where: { shopId: shopRecord.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { responses: true }
      }
    }
  });
}

export async function getSurvey(id, shop) {
  return db.survey.findFirst({
    where: {
      id,
      shop: { shopifyDomain: shop }
    },
    include: {
      questions: {
        orderBy: { order: "asc" }
      }
    }
  });
}

export async function createSurvey(shop, data) {
  const shopRecord = await db.shop.upsert({
    where: { shopifyDomain: shop },
    update: {},
    create: { shopifyDomain: shop },
  });

  const { questions, ...surveyData } = data;

  return db.survey.create({
    data: {
      ...surveyData,
      shopId: shopRecord.id,
      questions: {
        create: questions.map((q, index) => ({
          ...q,
          order: index,
        })),
      },
    },
  });
}

export async function updateSurvey(id, shop, data) {
  const { questions, ...surveyData } = data;

  return db.$transaction(async (tx) => {
    // 1. Update the survey basic info
    await tx.survey.update({
      where: { id },
      data: surveyData,
    });

    // 2. To avoid deleting questions and losing associated answers,
    // we sync them. For simplicity in this version, we'll identify existing questions.
    const currentQuestions = await tx.question.findMany({
      where: { surveyId: id },
      select: { id: true },
    });

    const currentIds = currentQuestions.map((q) => q.id);
    const newQuestionIds = questions.map((q) => q.id).filter(Boolean);

    // Remove questions that are no longer in the list
    const idsToRemove = currentIds.filter((id) => !newQuestionIds.includes(id));
    if (idsToRemove.length > 0) {
      await tx.question.deleteMany({
        where: { id: { in: idsToRemove } },
      });
    }

    // Update existing and create new ones
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.id) {
        await tx.question.update({
          where: { id: q.id },
          data: {
            title: q.title,
            type: q.type,
            helpText: q.helpText,
            required: q.required,
            order: i,
            options: q.options,
          },
        });
      } else {
        await tx.question.create({
          data: {
            surveyId: id,
            title: q.title,
            type: q.type,
            helpText: q.helpText,
            required: q.required,
            order: i,
            options: q.options,
          },
        });
      }
    }
  });
}

export async function deleteSurvey(id, shop) {
  return db.survey.deleteMany({
    where: {
      id,
      shop: { shopifyDomain: shop }
    }
  });
}
