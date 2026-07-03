import { useState, useCallback } from "react";
import {
  Card,
  TextField,
  Select,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Box,
  Divider,
  Icon,
  Layout,
} from "@shopify/polaris";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";

const QUESTION_TYPES = [
  { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
  { label: "Text Input", value: "TEXT_INPUT" },
  { label: "Star Rating", value: "STAR_RATING" },
  { label: "Net Promoter Score (NPS)", value: "NPS" },
];

export function SurveyBuilder({ initialData, onSave, isLoading }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [questions, setQuestions] = useState(initialData?.questions || []);

  // Customization
  const [primaryColor, setPrimaryColor] = useState(initialData?.primaryColor || "#008060");
  const [textColor, setTextColor] = useState(initialData?.textColor || "#202223");
  const [backgroundColor, setBackgroundColor] = useState(initialData?.backgroundColor || "#ffffff");
  const [placement, setPlacement] = useState(initialData?.placement || "INLINE");

  // Incentives
  const [incentiveEnabled, setIncentiveEnabled] = useState(initialData?.incentiveEnabled || false);
  const [discountTitle, setDiscountTitle] = useState(initialData?.discountTitle || "");
  const [discountType, setDiscountType] = useState(initialData?.discountType || "percentage");
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue || "");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "MULTIPLE_CHOICE",
        title: "",
        helpText: "",
        required: false,
        options: ["Option 1"],
      },
    ]);
  };

  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    const options = newQuestions[qIndex].options || [];
    newQuestions[qIndex].options = [...options, `Option ${options.length + 1}`];
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    setQuestions(newQuestions);
  };

  const handleSave = () => {
    onSave({
      title,
      description,
      questions,
      primaryColor,
      textColor,
      backgroundColor,
      placement,
      incentiveEnabled,
      discountTitle,
      discountType,
      discountValue,
    });
  };

  return (
    <BlockStack gap="500">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Survey Details
                </Text>
                <TextField
                  label="Title"
                  value={title}
                  onChange={setTitle}
                  autoComplete="off"
                  placeholder="e.g., Post-Purchase Feedback"
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  multiline={3}
                  autoComplete="off"
                />
              </BlockStack>
            </Card>

            <Text variant="headingMd" as="h2">
              Questions
            </Text>

      {questions.map((question, qIndex) => (
        <Card key={qIndex}>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingSm" as="h3">
                Question {qIndex + 1}
              </Text>
              <Button
                icon={DeleteIcon}
                variant="tertiary"
                tone="critical"
                onClick={() => removeQuestion(qIndex)}
              />
            </InlineStack>

            <Layout>
              <Layout.Section variant="oneHalf">
                <TextField
                  label="Question Title"
                  value={question.title}
                  onChange={(v) => updateQuestion(qIndex, "title", v)}
                  autoComplete="off"
                />
              </Layout.Section>
              <Layout.Section variant="oneHalf">
                <Select
                  label="Question Type"
                  options={QUESTION_TYPES}
                  value={question.type}
                  onChange={(v) => updateQuestion(qIndex, "type", v)}
                />
              </Layout.Section>
            </Layout>

            {question.type === "MULTIPLE_CHOICE" && (
              <Box paddingBlockStart="200">
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="bold">
                    Options
                  </Text>
                  {question.options?.map((option, oIndex) => (
                    <InlineStack key={oIndex} gap="200" align="start">
                      <Box flex="1">
                        <TextField
                          value={option}
                          onChange={(v) => updateOption(qIndex, oIndex, v)}
                          autoComplete="off"
                        />
                      </Box>
                      <Button
                        icon={DeleteIcon}
                        variant="tertiary"
                        tone="critical"
                        onClick={() => removeOption(qIndex, oIndex)}
                      />
                    </InlineStack>
                  ))}
                  <Button
                    icon={PlusIcon}
                    variant="plain"
                    onClick={() => addOption(qIndex)}
                  >
                    Add Option
                  </Button>
                </BlockStack>
              </Box>
            )}
          </BlockStack>
        </Card>
      ))}

            <Button icon={PlusIcon} onClick={addQuestion}>
              Add Question
            </Button>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Appearance
                </Text>
                <TextField
                  label="Primary Color"
                  value={primaryColor}
                  onChange={setPrimaryColor}
                  autoComplete="off"
                  type="color"
                />
                <TextField
                  label="Text Color"
                  value={textColor}
                  onChange={setTextColor}
                  autoComplete="off"
                  type="color"
                />
                <TextField
                  label="Background Color"
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                  autoComplete="off"
                  type="color"
                />
                <Select
                  label="Placement"
                  options={[
                    { label: "Inline", value: "INLINE" },
                    { label: "Popup", value: "POPUP" },
                    { label: "Post-Purchase Page", value: "POST_PURCHASE" },
                  ]}
                  value={placement}
                  onChange={setPlacement}
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Incentives
                </Text>
                <Select
                  label="Enable Discount Incentive"
                  options={[
                    { label: "Disabled", value: false },
                    { label: "Enabled", value: true },
                  ]}
                  value={incentiveEnabled}
                  onChange={(v) => setIncentiveEnabled(v === "true")}
                />

                {incentiveEnabled && (
                  <BlockStack gap="300">
                    <TextField
                      label="Discount Title"
                      value={discountTitle}
                      onChange={setDiscountTitle}
                      placeholder="e.g., 10% OFF"
                      autoComplete="off"
                    />
                    <Select
                      label="Discount Type"
                      options={[
                        { label: "Percentage", value: "percentage" },
                        { label: "Fixed Amount", value: "fixed_amount" },
                      ]}
                      value={discountType}
                      onChange={setDiscountType}
                    />
                    <TextField
                      label="Value"
                      value={discountValue}
                      onChange={setDiscountValue}
                      placeholder="e.g., 10"
                      autoComplete="off"
                    />
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      <Divider />

      <InlineStack align="end">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={isLoading}
          disabled={!title || questions.length === 0}
        >
          Save Survey
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
