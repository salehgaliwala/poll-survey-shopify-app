import { json, redirect } from "@remix-run/node";
import { useSubmit, useNavigation } from "@remix-run/react";
import { Page, Layout } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { createSurvey } from "../models/survey.server";
import { SurveyBuilder } from "../components/SurveyBuilder";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const data = JSON.parse(formData.get("survey"));

  const survey = await createSurvey(session.shop, data);

  return redirect(`/app/surveys/${survey.id}`);
};

export default function NewSurvey() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const handleSave = (data) => {
    submit({ survey: JSON.stringify(data) }, { method: "post" });
  };

  return (
    <Page
      title="Create Survey"
      backAction={{ content: "Surveys", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <SurveyBuilder onSave={handleSave} isLoading={isLoading} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
