import { RubricStatusBubble } from "@/components/RubricStatusBubble";
import { FullRubric, Rubric, RubricQuestion } from "@/types";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import {
  deprecateRubric,
  duplicateRubric,
  getRubric,
  listRubrics,
} from "@/lib/rubrics-api";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Anchor,
  Breadcrumbs,
  Container,
  Group,
  Stack,
  Title,
  Text,
  Button,
  Card,
  Paper,
  Badge,
  Select,
} from "@mantine/core";

const sectionTitles = [
  "Section 1 - Introduction",
  "Section 2 - Materials & Sourcing",
  "Section 3 - Methodology & Reproducibility",
  "Section 4 - Replication, Risk of Bias & Statistics",
  "Section 5 - Reporting & Transparency",
];

interface RubricViewingPageProps {
  rubric: FullRubric;
}

export function RubricViewingPage({
  rubric: initialRubric,
}: RubricViewingPageProps) {
  // Local copy so the page can reflect changes (e.g. deprecation) without refetching
  const [rubric, setRubric] = useState(initialRubric);

  const stats: Stat[] = [
    {
      label: "Low Quality Threshold",
      value: rubric.lowQualityThreshold,
    },
    {
      label: "High Quality Threshold",
      value: rubric.highQualityThreshold,
    },
    {
      label: "Questions",
      value: rubric.questions.length,
    },
    {
      label: "Deprecated",
      value: rubric.replacedByID !== null ? "Yes" : "No",
    },
  ];

  return (
    <Container fluid py="md">
      <Stack gap="xl">
        <Breadcrumbs separator=">" separatorMargin="md" mt="xs">
          <Anchor href="/rubrics" c="gray" key={0}>
            Rubrics
          </Anchor>
          <Anchor href={`/rubrics/?id={id}`} c="dark" key={0}>
            Rubric Title
          </Anchor>
        </Breadcrumbs>
        <TitleRow
          rubric={rubric}
          onDeprecated={(replacementID) =>
            setRubric((prev) => ({ ...prev, replacedByID: replacementID }))
          }
        />
        <StatsRow stats={stats} />
        <ReadOnlyNotice />
        {sectionTitles.map((title, idx) => (
          <Paper key={idx} shadow="sm" withBorder p="lg">
            <Section
              title={title}
              questions={rubric.questions.filter((q) => q.section === idx + 1)}
            />
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}

interface TitleRowProps {
  rubric: FullRubric;
  /** Called with the replacement rubric's ID after the rubric is deprecated */
  onDeprecated: (replacementID: string) => void;
}

function TitleRow({ rubric, onDeprecated }: TitleRowProps) {
  const router = useRouter();
  const [duplicateInProgress, setDuplicateInProgress] = useState(false);
  const [deprecateInProgress, setDeprecateInProgress] = useState(false);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [replacementOptions, setReplacementOptions] = useState<Rubric[]>([]);
  const [replacementID, setReplacementID] = useState<string | null>(null);
  const [errorText, setErrorText] = useState("");
  // The backend does not store deprecation dates yet, so this is only known
  // right after the user deprecates the rubric on this page
  const [deprecationDate, setDeprecationDate] = useState<Date | null>(null);
  const [replacementTitle, setReplacementTitle] = useState<string | null>(null);

  const isDeprecated = rubric.replacedByID !== null;
  const rubricStatus = isDeprecated ? "deprecated" : "published";

  // Fetch the replacement rubric's title for the link
  useEffect(() => {
    if (rubric.replacedByID === null) return;
    let cancelled = false;

    const fetchReplacement = async () => {
      const { result, error } = await getRubric(rubric.replacedByID!);
      if (cancelled) return;
      setReplacementTitle(error ? null : result.title);
    };

    fetchReplacement();

    return () => {
      cancelled = true;
    };
  }, [rubric.replacedByID]);

  // Load candidate replacement rubrics (published, not deprecated, not this one)
  // when the deprecate modal is opened
  useEffect(() => {
    if (!modalOpened) return;
    let cancelled = false;

    const fetchOptions = async () => {
      const { result, error } = await listRubrics({ deprecated: false });
      if (cancelled) return;
      if (error) {
        setErrorText("Failed to load replacement rubrics");
        return;
      }
      setReplacementOptions(
        result.rubrics
          .filter((r) => r.publicationDate !== null && r.id !== rubric.rubricID)
          .map((r) => ({
            rubricID: r.id,
            title: r.title,
            highQualityThreshold: r.highQualityThreshold,
            lowQualityThreshold: r.lowQualityThreshold,
            questionCount: r.questionCount,
            publicationDate: r.publicationDate,
            replacedByID: r.replacedByID,
          })),
      );
    };

    fetchOptions();

    return () => {
      cancelled = true;
    };
  }, [modalOpened, rubric.rubricID]);

  const handleDuplicate = async () => {
    setDuplicateInProgress(true);
    setErrorText("");
    const { result, error } = await duplicateRubric(rubric.rubricID);
    if (error) {
      setErrorText("Failed to duplicate rubric");
      setDuplicateInProgress(false);
      return;
    }
    // Leave the button disabled while navigating to the new draft
    router.push(`/rubrics?id=${result.rubricID}`);
  };

  const handleDeprecate = async () => {
    if (replacementID === null) return;
    setDeprecateInProgress(true);
    setErrorText("");
    const { result, error } = await deprecateRubric(
      rubric.rubricID,
      replacementID,
    );
    setDeprecateInProgress(false);
    if (error) {
      setErrorText("Failed to deprecate rubric");
      return;
    }
    setDeprecationDate(new Date(result.deprecationDate));
    closeModal();
    onDeprecated(replacementID);
  };

  return (
    <Group justify="space-between">
      <Stack gap="xs">
        <Group>
          <Title>{rubric.title}</Title>
          <RubricStatusBubble status={rubricStatus} />
          <RubricStatusBubble status="readonly" />
        </Group>
        <Text size="sm" c="dimmed">
          Designed by {rubric.designerID} - Published{" "}
          {rubric.publicationDate?.toLocaleDateString()}
        </Text>
        {isDeprecated && (
          <Text size="sm" c="dimmed">
            Deprecated
            {deprecationDate && ` ${deprecationDate.toLocaleDateString()}`} -
            Replaced by{" "}
            <Anchor href={`/rubrics?id=${rubric.replacedByID}`}>
              {replacementTitle ?? "replacement rubric"}
            </Anchor>
          </Text>
        )}
        {errorText && (
          <Text size="sm" c="red">
            {errorText}
          </Text>
        )}
      </Stack>
      <Group>
        <Button
          color="dark"
          variant="filled"
          onClick={handleDuplicate}
          disabled={duplicateInProgress}
        >
          Duplicate
        </Button>
        {!isDeprecated && (
          <Button
            color="red"
            variant="outline"
            onClick={openModal}
            disabled={deprecateInProgress}
          >
            Deprecate
          </Button>
        )}
      </Group>
      <ConfirmationModal
        opened={modalOpened}
        closeModal={closeModal}
        action={handleDeprecate}
        infoText="Deprecating a rubric marks it as replaced by another rubric. This cannot be undone."
        confirmationText={rubric.title}
        canConfirm={replacementID !== null}
      >
        <Select
          label="Replacement rubric"
          placeholder="Select a rubric"
          data={replacementOptions.map((r) => ({
            value: r.rubricID,
            label: r.title,
          }))}
          value={replacementID}
          onChange={setReplacementID}
          searchable
          withAsterisk
        />
      </ConfirmationModal>
    </Group>
  );
}

interface Stat {
  label: string;
  value: string | number;
}

function StatsRow({ stats }: { stats: Stat[] }) {
  const statCards = stats.map((stat, idx) => (
    <Card key={idx} withBorder shadow="xs" h="100%">
      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
        {stat.label}
      </Text>
      <Text size="lg">{stat.value}</Text>
    </Card>
  ));

  return (
    <Group grow align="stretch" gap="md">
      {statCards}
    </Group>
  );
}

function ReadOnlyNotice() {
  return (
    <Paper bg="gray.1" p="sm">
      Published rubrics are read-only. Duplicate this rubric to start a new,
      editable draft from it.
    </Paper>
  );
}

interface SectionProps {
  title: string;
  questions: RubricQuestion[];
}

function Section({ title, questions }: SectionProps) {
  const sortedQuestions = [...questions].sort((a, b) => a.index - b.index);

  return (
    <Stack>
      <Group>
        <Title order={4}>{title}</Title>
        <Badge color="gray" variant="light">
          {questions.length} {questions.length === 1 ? "question" : "questions"}
        </Badge>
      </Group>
      {sortedQuestions.length === 0 ? (
        <Text c="dimmed">No questions</Text>
      ) : (
        sortedQuestions.map((question, idx) => (
          <Question key={idx} number={idx + 1} question={question} />
        ))
      )}
    </Stack>
  );
}

interface ScoreExplanation {
  score: string;
  explanation: string;
}

/**
 * Parses a score explanation string of the form
 * "5 = explanation; 4 = explanation; ... 1 = explanation".
 * Returns null if the string does not match this format.
 */
function parseScoreExplanations(
  text: string | null,
): ScoreExplanation[] | null {
  if (text === null) return null;

  const parts = text
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part !== "");

  const expectedScores = ["5", "4", "3", "2", "1"];
  if (parts.length !== expectedScores.length) return null;

  const parsed: ScoreExplanation[] = [];
  for (let i = 0; i < parts.length; i++) {
    const match = parts[i].match(/^(\d+)\s*=\s*(.+)$/);
    if (match === null || match[1] !== expectedScores[i]) return null;
    parsed.push({ score: match[1], explanation: match[2].trim() });
  }
  return parsed;
}

interface QuestionProps {
  number: number;
  question: RubricQuestion;
}

function Question({ number, question }: QuestionProps) {
  const scoreExplanations = parseScoreExplanations(question.scoreExplanations);

  return (
    <Stack>
      <Group gap="xs">
        <Text c="gray">{number}.</Text>
        <Text>{question.question}</Text>
      </Group>
      {scoreExplanations !== null ? (
        <Group grow align="stretch">
          {scoreExplanations.map(({ score, explanation }) => (
            <Card key={score} bg="gray.1">
              <Title order={5}>{score}</Title>
              <Text size="sm" c="gray.7">
                {explanation}
              </Text>
            </Card>
          ))}
        </Group>
      ) : (
        <Card bg="gray.1">
          <Text size="sm" c="gray.7">
            {question.scoreExplanations}
          </Text>
        </Card>
      )}
    </Stack>
  );
}
