import { Rubric, RubricQuestion } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Stack,
  Group,
  Title,
  Text,
  Button,
  Loader,
  Paper,
  Container,
  TextInput,
  Textarea,
  NumberInput,
  Divider,
  Anchor,
} from "@mantine/core";
import { backend } from "@/axios-client";
import { AxiosError } from "axios";

export function RubricEditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Determine whether we're creating or editing
  const rubricID = searchParams.get("id");
  const isNew = searchParams.get("new") === "true";

  const creationStarted = useRef(false);

  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [questions, setQuestions] = useState<RubricQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  // CREATE A NEW RUBRIC
  useEffect(() => {
    if (!isNew || rubricID || creationStarted.current) {
      return;
    }

    creationStarted.current = true;

    async function createNewRubric() {
      console.log("Starting rubric creation...");

      try {
        const response = await backend.post("/rubrics", {
          name: "Untitled Rubric",
          highQualityThreshold: 85,
          lowQualityThreshold: 50,
        });

        console.log("Create rubric response:", response.data);

        const newRubricID = response.data.rubricID;

        if (!newRubricID) {
          throw new Error(
            "The server did not return a rubricID."
          );
        }

        console.log("Created rubric:", newRubricID);

        // Switch from creation mode to editing mode
        router.replace(`/rubrics/edit?id=${newRubricID}`);

      } catch (err) {
        console.error("Error creating rubric:", err);

        if (err instanceof AxiosError) {
          console.error("Backend response:", err.response?.data);

          setError(
            err.response?.data?.error ??
            "Unable to create rubric."
          );
        } else {
          setError("Unable to create rubric.");
        }

        setLoading(false);
      }
    }

    createNewRubric();
  }, [isNew, rubricID, router]);


  // FETCH AN EXISTING RUBRIC
  useEffect(() => {
    if (!rubricID) {
      return;
    }

    let cancelled = false;

    async function fetchRubric() {
      setLoading(true);

      try {
        const response = await backend.get<Rubric & {
          questions: Array<{
            section: number;
            index: number;
            question: string | null;
            scoreExplanations: string[] | string | null;
          }>;
        }>(`/rubrics/${rubricID}`);

        if (cancelled) return;

        const data = response.data;

        const loadedQuestions: RubricQuestion[] =
          data.questions.map((q) => ({
            section: q.section,
            index: q.index,
            question: q.question ?? "",
            scoreExplanations:
              typeof q.scoreExplanations === "string"
                ? JSON.parse(q.scoreExplanations)
                : q.scoreExplanations ?? [],
          }));

        setRubric(data);
        setQuestions(loadedQuestions);
        setError(null);

      } catch (err) {
        console.error("Error fetching rubric:", err);

        if (!cancelled) {
          if (err instanceof AxiosError && err.response) {
            setError(
              err.response.data?.error ?? "Unable to load rubric."
            );
          } else {
            setError("Unable to load rubric.");
          }
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRubric();

    return () => {
      cancelled = true;
    };
  }, [rubricID]);

  // UPDATE RUBRIC DETAILS
  async function editRubric(updatedFields: {
    name?: string | undefined;
    highQualityThreshold?: number | undefined;
    lowQualityThreshold?: number | undefined;
  }) {
    if (!rubricID) return;

    try {
      await backend.patch(`/rubrics/${rubricID}`, updatedFields);

      setRubric((previous) =>
        previous ? { 
          ...previous, 
          ...updatedFields,
          title: updatedFields.name ?? previous.title,
          highQualityThreshold: updatedFields.highQualityThreshold ?? previous.highQualityThreshold,
          lowQualityThreshold: updatedFields.lowQualityThreshold ?? previous.lowQualityThreshold,
        } : previous
      );

    } catch (err) {
      console.error("Error editing rubric:", err);
    }
  }

  // ADD QUESTION
  async function addQuestion(
    section: number,
    index: number,
    question: string,
    scoreExplanations: string[]
  ) {
    if (!rubricID) return;

    try {
      const response = await backend.post<RubricQuestion>(
        `/rubrics/${rubricID}/questions`,
        {
          section,
          index,
          question,
          scoreExplanations,
        }
      );

      setQuestions((previous) => [
        ...previous,
        response.data,
      ]);

    } catch (err) {
      console.error("Error adding question:", err);
      throw err;
    }
  }


  // EDIT QUESTION
  async function saveQuestion(question: RubricQuestion) {
    if (!rubricID) return;

    try {
      await backend.patch(
        `/rubrics/${rubricID}/questions/${question.section}/${question.index}`,
        {
          question: question.question,
          scoreExplanations: question.scoreExplanations,
        }
      );

      setQuestions((previous) =>
        previous.map((q) =>
          q.section === question.section &&
          q.index === question.index
            ? question
            : q
        )
      );

    } catch (err) {
      console.error("Error saving question:", err);
      throw err;
    }
  }


  // DELETE QUESTION
  async function deleteQuestion(section: number, index: number) {
    if (!rubricID) return;

    try {
      await backend.delete(
        `/rubrics/${rubricID}/questions/${section}/${index}`
      );

      // Update local state after successful deletion
      setQuestions((previous) =>
        previous
          .filter(
            (q) => !(q.section === section && q.index === index)
          )
          .map((q) =>
            q.section === section && q.index > index
              ? { ...q, index: q.index - 1 }
              : q
          )
      );

    } catch (err) {
      console.error("Error deleting question:", err);
      throw err;
    }
  }


  // DELETE RUBRIC
  async function deleteRubric() {
    if (!rubricID) return;

    if (!window.confirm("Are you sure you want to delete this rubric?")) {
      return;
    }

    try {
      await backend.delete(`/rubrics/${rubricID}`);
      router.push("/rubrics");

    } catch (err) {
      console.error("Error deleting rubric:", err);
    }
  }


  // PUBLISH RUBRIC
  async function publishRubric() {
    if (!rubricID) return;

    try {
      await backend.post(`/rubrics/${rubricID}/publish`);
      router.push(`/rubrics/view?id=${rubricID}`);

    } catch (err) {
      console.error("Error publishing rubric:", err);
    }
  }


  // LOADING AND ERROR STATES
  if (loading) return <RubricLoading />;

  if (error) {
    return (
      <Container>
        <Text c="red">{error}</Text>
        <Button onClick={() => router.push("/rubrics")}>
          Back to Rubrics
        </Button>
      </Container>
    );
  }

  if (!rubricID) {
    return <Text>No rubric selected.</Text>;
  }

  if (!rubric) {
    return <RubricNotFound rubricID={rubricID} />;
  }


  // GROUP QUESTIONS BY SECTION

  const sections = [1, 2, 3, 4, 5];


  // PAGE UI
  return (
    <Container fluid>
      <Stack gap="lg">

        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Title order={2}>{rubric.title}</Title>
            <Text size="sm" c="dimmed">
              Edit the rubric details and its questions.
            </Text>
          </Stack>

          <Group>
            <Button
              color="red"
              variant="outline"
              onClick={deleteRubric}
            >
              Delete Rubric
            </Button>

            <Button color="green" onClick={publishRubric}>
              Publish
            </Button>
          </Group>
        </Group>

        <Divider />

        {/* Rubric Details */}

        <Paper withBorder shadow="xs" p="lg">
          <Stack>
            <Title order={4}>Rubric Details</Title>

            <TextInput
              label="Title"
              value={rubric.title}
              onChange={(event) =>
                setRubric({
                  ...rubric,
                  title: event.currentTarget.value,
                })
              }
              onBlur={() =>
                editRubric({ name: rubric.title })
              }
            />

            <Group grow>
              <NumberInput
                label="High Score Threshold"
                value={rubric.highQualityThreshold}
                onChange={(value) => {
                  if (typeof value === "number") {
                    setRubric({
                      ...rubric,
                      highQualityThreshold: value,
                    });
                  }
                }}
                onBlur={() =>
                  editRubric({
                    highQualityThreshold: rubric.highQualityThreshold,
                  })
                }
              />

              <NumberInput
                label="Low Score Threshold"
                value={rubric.lowQualityThreshold}
                onChange={(value) => {
                  if (typeof value === "number") {
                    setRubric({
                      ...rubric,
                      lowQualityThreshold: value,
                    });
                  }
                }}
                onBlur={() =>
                  editRubric({
                    lowQualityThreshold: rubric.lowQualityThreshold,
                  })
                }
              />
            </Group>
          </Stack>
        </Paper>

        {/* Sections and Questions */}

        <Group align="flex-start" wrap="nowrap" gap="lg">

          <Paper
            withBorder
            p="md"
            w={220}
            style={{
              position: "sticky",
              top: 20,
              flexShrink: 0,
            }}
          >
            <Stack gap="sm">
              <Title order={5}>Sections</Title>

              {sections.map((section) => (
                <Anchor
                  key={section}
                  component="button"
                  type="button"
                  onClick={() => {
                    document
                      .getElementById(`section-${section}`)
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                >
                  Section {section}
                </Anchor>
              ))}
            </Stack>
          </Paper>

          <Stack style={{ flex: 1 }} gap="lg">

            {sections.map((section) => (
              <SectionCard
                key={section}
                section={section}
                questions={questions.filter(
                  (q) => q.section === section
                )}
                onAddQuestion={addQuestion}
                onSaveQuestion={saveQuestion}
                onDeleteQuestion={deleteQuestion}
              />
            ))}

            {/* Allow adding the first question */}
            <Button
              variant="light"
              onClick={() => {
                // Handled by the SectionCard component.
              }}
              disabled={sections.length === 0}
            >
              Questions are managed within each section
            </Button>

          </Stack>
        </Group>
      </Stack>
    </Container>
  );
}


// Section Card
interface SectionCardProps {
  section: number;
  questions: RubricQuestion[];
  onAddQuestion: (
    section: number,
    index: number,
    question: string,
    explanations: string[]
  ) => Promise<void>;
  onSaveQuestion: (question: RubricQuestion) => Promise<void>;
  onDeleteQuestion: (section: number, index: number) => Promise<void>;
}

function SectionCard({
  section,
  questions,
  onAddQuestion,
  onSaveQuestion,
  onDeleteQuestion,
}: SectionCardProps) {
  const [addingQuestion, setAddingQuestion] = useState(false);

  const sortedQuestions = [...questions].sort(
    (a, b) => a.index - b.index
  );
  const nextIndex = sortedQuestions.length

  return (
    <Paper
      id={`section-${section}`}
      withBorder
      shadow="xs"
      p="lg"
      style={{ scrollMarginTop: 20 }}
    >
      <Stack gap="md">
        <Title order={3}>Section {section}</Title>

        {/* Display existing questions */}
        {sortedQuestions.map((question) => (
          <QuestionCard
            key={question.index}
            question={question}
            onSave={onSaveQuestion}
            onDelete={onDeleteQuestion}
          />
        ))}

        {/* Automatically display an empty question if none exist */}
        {sortedQuestions.length === 0 && (
          <AddQuestionCard
            section={section}
            index={nextIndex}
            onAdd={onAddQuestion}
            onCancel={() => {}}
            showCancel={false}
          />
        )}

        {/* Allow adding additional questions */}
        {addingQuestion ? (
          <AddQuestionCard
            section={section}
            index={nextIndex}
            onAdd={onAddQuestion}
            onCancel={() => setAddingQuestion(false)}
          />
        ) : (
          <Button
            variant="light"
            color="dark"
            onClick={() => setAddingQuestion(true)}
          >
            + Add Question
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

// Question Card
function QuestionCard({
  question,
  onSave,
  onDelete,
}: {
  question: RubricQuestion;
  onSave: (question: RubricQuestion) => Promise<void>;
  onDelete: (section: number, index: number) => Promise<void>;
}) {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(editedQuestion);
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this question?")) return;

    setDeleting(true);
    await onDelete(question.section, question.index);
    setDeleting(false);
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={5}>
            Question {question.index + 1}
          </Title>

          <Button
            color="red"
            variant="subtle"
            size="xs"
            onClick={handleDelete}
            loading={deleting}
          >
            Delete
          </Button>
        </Group>

        <Textarea
          label="Question"
          value={editedQuestion.question}
          onChange={(event) =>
            setEditedQuestion({
              ...editedQuestion,
              question: event.currentTarget.value,
            })
          }
        />

        <Divider />

        <Title order={6}>Rating Explanations</Title>

        {Array.from({ length: 5 }, (_, index) => (
          <Textarea
            key={index}
            label={`Score ${index + 1}`}
            value={editedQuestion.scoreExplanations[index] ?? ""}
            onChange={(event) => {
              const explanations = [
                ...editedQuestion.scoreExplanations,
              ];

              explanations[index] = event.currentTarget.value;

              setEditedQuestion({
                ...editedQuestion,
                scoreExplanations: explanations,
              });
            }}
          />
        ))}

        <Group justify="flex-end">
          <Button
            color="dark"
            onClick={handleSave}
            loading={saving}
          >
            Save Question
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}


  // Adding a Question Card
  function AddQuestionCard({
    index,
    section,
    onAdd,
    onCancel,
    showCancel = true,
  }: {
    index: number;
    section: number;
    onAdd: (
      section: number,
      index: number,
      question: string,
      explanations: string[]
    ) => Promise<void>;
    onCancel: () => void;
    showCancel?: boolean;
  }) {
    const [question, setQuestion] = useState("");
    const [explanations, setExplanations] = useState(
      ["", "", "", "", ""]
    );
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
      if (!question.trim()) return;

      setLoading(true);

      try {
        await onAdd(section, index, question, explanations);
        onCancel();
      } catch (error) {
        console.error("Error adding question:", error);
      } finally {
        setLoading(false);
      }
    }

    return (
      <Paper withBorder p="md" radius="md" bg="gray.0">
        <Stack>
          <Title order={5}>Add Question</Title>

          <Textarea
            label="Question"
            placeholder="Enter the question..."
            value={question}
            onChange={(event) =>
              setQuestion(event.currentTarget.value)
            }
          />

          <Title order={6}>Rating Explanations</Title>

          {explanations.map((explanation, index) => (
            <Textarea
              key={index}
              label={`Score ${index + 1}`}
              value={explanation}
              onChange={(event) => {
                const updated = [...explanations];
                updated[index] = event.currentTarget.value;
                setExplanations(updated);
              }}
            />
          ))}

          <Group justify="flex-end">
            {showCancel && (
              <Button
                variant="subtle"
                color="gray"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}

            <Button
              color="dark"
              onClick={handleSubmit}
              loading={loading}
              disabled={!question.trim()}
            >
              Add Question
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  }


// Loading / Error Components
function RubricLoading() {
  return (
    <Stack h="100vh" align="center" justify="center">
      <Text size="xl">Loading rubric...</Text>
      <Loader color="blue" size="xl" />
    </Stack>
  );
}

function RubricNotFound({
  rubricID,
}: {
  rubricID: string;
}) {
  return (
    <Stack align="center">
      <Title order={2}>Rubric Not Found</Title>
      <Text c="dimmed">
        Rubric with ID {rubricID} could not be found.
      </Text>
    </Stack>
  );
}

