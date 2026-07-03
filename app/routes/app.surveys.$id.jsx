import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Tabs,
  Box,
  ResourceList,
  ResourceItem,
  InlineStack,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import { getSurvey, updateSurvey, deleteSurvey } from "../models/survey.server";
import { getSurveyResponses } from "../models/response.server";
import { SurveyBuilder } from "../components/SurveyBuilder";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const survey = await getSurvey(params.id, session.shop);
  const responses = await getSurveyResponses(params.id);

  if (!survey) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ survey, responses });
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteSurvey(params.id, session.shop);
    return redirect("/app");
  }

  const data = JSON.parse(formData.get("survey"));
  await updateSurvey(params.id, session.shop, data);

  return json({ success: true });
};

export default function SurveyDetails() {
  const { survey, responses } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { id: "edit", content: "Edit Survey", accessibilityLabel: "Edit Survey" },
    { id: "analytics", content: "Analytics", accessibilityLabel: "Analytics" },
  ];

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelectedTab(selectedTabIndex),
    []
  );

  const handleSave = (data) => {
    submit({ survey: JSON.stringify(data) }, { method: "post" });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this survey?")) {
      submit({ intent: "delete" }, { method: "post" });
    }
  };

  return (
    <Page
      title={survey.title}
      backAction={{ content: "Surveys", url: "/app" }}
      secondaryActions={[
        {
          content: "Delete survey",
          destructive: true,
          onAction: handleDelete,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
            <Box paddingBlockStart="400">
              {selectedTab === 0 ? (
                <SurveyBuilder
                  initialData={survey}
                  onSave={handleSave}
                  isLoading={isLoading}
                />
              ) : (
                <BlockStack gap="500">
                  <Card>
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h2">
                        Summary
                      </Text>
                      <Layout>
                        <Layout.Section oneThird>
                          <Card background="bg-surface-secondary">
                            <Text variant="headingLg" as="p">{responses.length}</Text>
                            <Text variant="bodyMd" as="p">Total Responses</Text>
                          </Card>
                        </Layout.Section>
                        <Layout.Section oneThird>
                          <Card background="bg-surface-secondary">
                            <Text variant="headingLg" as="p">
                              {survey.status === "ACTIVE" ? "Active" : "Draft"}
                            </Text>
                            <Text variant="bodyMd" as="p">Current Status</Text>
                          </Card>
                        </Layout.Section>
                      </Layout>
                    </BlockStack>
                  </Card>

                  <Card padding="0">
                    <ResourceList
                      resourceName={{ singular: "response", plural: "responses" }}
                      items={responses}
                      renderItem={(item) => {
                        const { id, customerEmail, createdAt, answers } = item;
                        return (
                          <ResourceItem id={id} verticalAlign="center">
                            <BlockStack gap="200">
                              <InlineStack align="space-between">
                                <Text fontWeight="bold" as="span">
                                  {customerEmail || "Anonymous"}
                                </Text>
                                <Text variant="bodySm" as="span">
                                  {new Date(createdAt).toLocaleString()}
                                </Text>
                              </InlineStack>
                              <Box paddingBlockStart="100">
                                {answers.map((a, i) => (
                                  <div key={i} style={{ marginBottom: "4px" }}>
                                    <Text variant="bodySm" color="subdued">
                                      Q: {a.question.title}
                                    </Text>
                                    <Text variant="bodyMd">{a.value}</Text>
                                  </div>
                                ))}
                              </Box>
                            </BlockStack>
                          </ResourceItem>
                        );
                      }}
                    />
                  </Card>
                </BlockStack>
              )}
            </Box>
          </Tabs>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
