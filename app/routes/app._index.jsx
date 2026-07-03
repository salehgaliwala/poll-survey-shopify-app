import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  EmptyState,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getSurveys } from "../models/survey.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const surveys = await getSurveys(session.shop);

  return json({ surveys });
};

export default function Index() {
  const { surveys } = useLoaderData();
  const navigate = useNavigate();

  const resourceName = {
    singular: "survey",
    plural: "surveys",
  };

  return (
    <Page
      title="Surveys"
      primaryAction={{
        content: "Create survey",
        onAction: () => navigate("/app/surveys/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {surveys.length === 0 ? (
              <EmptyState
                heading="Manage your surveys"
                action={{
                  content: "Create survey",
                  onAction: () => navigate("/app/surveys/new"),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Track customer feedback and improve your store with custom surveys.</p>
              </EmptyState>
            ) : (
              <ResourceList
                resourceName={resourceName}
                items={surveys}
                renderItem={(item) => {
                  const { id, title, status, _count, updatedAt } = item;
                  const date = new Date(updatedAt).toLocaleDateString();

                  return (
                    <ResourceItem
                      id={id}
                      onClick={() => navigate(`/app/surveys/${id}`)}
                      accessibilityLabel={`View details for ${title}`}
                    >
                      <Layout>
                        <Layout.Section oneHalf>
                          <Text variant="bodyMd" fontWeight="bold" as="h3">
                            {title}
                          </Text>
                          <div style={{ color: "var(--p-color-text-subdued)" }}>
                            Updated on {date}
                          </div>
                        </Layout.Section>
                        <Layout.Section oneThird>
                          <Badge tone={status === "ACTIVE" ? "success" : "attention"}>
                            {status}
                          </Badge>
                        </Layout.Section>
                        <Layout.Section oneThird>
                          <Text as="span" variant="bodyMd">
                            {_count.responses} responses
                          </Text>
                        </Layout.Section>
                      </Layout>
                    </ResourceItem>
                  );
                }}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
