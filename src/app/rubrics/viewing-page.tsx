import { RubricStatusBubble } from "@/components/RubricStatusBubble";
import { FullRubric } from "@/types";
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

interface RubricViewingPageProps {
  rubric: FullRubric;
}

export function RubricViewingPage({ rubric }: RubricViewingPageProps) {
  const stats: Stat[] = [
    {
      label: "Low Quality Threshould",
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
        <Paper shadow="sm" withBorder p="lg">
          <Section />
        </Paper>
      </Stack>
    </Container>
  );
}

function TitleRow({ rubric }: { rubric: FullRubric }) {
  const rubricStatus = rubric.replacedByID !== null ? "deprecated" : "published";

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

function Section() {
  const questions = [<Question key={0} />, <Question key={1} />];

  return (
    <Stack>
      <Group>
        <Title order={4}>Section 1</Title>
        <Badge color="gray" variant="light">
          2 questions
        </Badge>
      </Group>
      {questions}
    </Stack>
  );
}

function Question() {
  return (
    <Stack>
      <Group gap="xs">
        <Text c="gray">1.</Text>
        <Text>Is the hypothesis clearly stated and testable?</Text>
      </Group>
      <Group grow align="stretch">
        <Card bg="gray.1">
          <Title order={5}>5</Title>
          <Text size="sm" c="gray.7">
            Clear, specific, and testable
          </Text>
        </Card>
        <Card bg="gray.1">
          <Title order={5}>4</Title>
          <Text size="sm" c="gray.7">
            Clear but could be more specific
          </Text>
        </Card>
        <Card bg="gray.1">
          <Title order={5}>3</Title>
          <Text size="sm" c="gray.7">
            Stated but vague
          </Text>
        </Card>
        <Card bg="gray.1">
          <Title order={5}>2</Title>
          <Text size="sm" c="gray.7">
            Only implied
          </Text>
        </Card>
        <Card bg="gray.1">
          <Title order={5}>1</Title>
          <Text size="sm" c="gray.7">
            Missing
          </Text>
        </Card>
      </Group>
    </Stack>
  );
}
