import { RubricStatusBubble } from "@/components/RubricStatusBubble";
import { FullRubric, RubricQuestion } from "@/types";
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

export function RubricViewingPage({ rubric }: RubricViewingPageProps) {
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
        <TitleRow rubric={rubric} />
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

function TitleRow({ rubric }: { rubric: FullRubric }) {
  const rubricStatus =
    rubric.replacedByID !== null ? "deprecated" : "published";

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
      </Stack>
      <Group>
        <Button color="dark" variant="filled">
          Duplicate
        </Button>
        <Button color="red" variant="outline">
          Deprecate
        </Button>
      </Group>
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
