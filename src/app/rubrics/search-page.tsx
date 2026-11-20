import {
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Group,
  InputWrapper,
  Paper,
  SegmentedControl,
  Stack,
  TextInput,
  Title,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import type { Rubric } from "@/types";
import { duplicateRubric, getRubric, listRubrics } from "@/lib/rubrics-api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RubricSearchPage() {
  // Full list of rubrics; filtering will be applied here before passing to ResultsList
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Case-insensitive title match against the search query
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRubrics = rubrics.filter((rubric) =>
    rubric.title.toLowerCase().includes(normalizedQuery),
  );

  // Fetch rubrics on mount
  useEffect(() => {
    let cancelled = false;

    const fetchRubrics = async () => {
      const { result, error } = await listRubrics({});
      if (error || cancelled) return;

      setRubrics(
        result.rubrics.map((rubric) => ({
          rubricID: rubric.id,
          title: rubric.title,
          highQualityThreshold: rubric.highQualityThreshold,
          lowQualityThreshold: rubric.lowQualityThreshold,
          questionCount: rubric.questionCount,
          // JSON delivers dates as strings, so convert explicitly
          publicationDate: rubric.publicationDate
            ? new Date(rubric.publicationDate)
            : null,
          replacedByID: rubric.replacedByID,
        })),
      );
    };

    fetchRubrics();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container fluid>
      <Stack>
        <Title>Browse Rubrics</Title>
        <Group align="flex-start">
          <Paper shadow="xs" withBorder p="lg" w={350}>
            <FiltersPanel />
          </Paper>
          <Stack w="Reviewers" style={{ flex: 1 }}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <ResultsList rubrics={filteredRubrics} allRubrics={rubrics} />
          </Stack>
        </Group>
      </Stack>
    </Container>
  );
}

type DeprecationStatus = "all" | "active" | "deprecated";

function FiltersPanel({}) {
  const [publishedBefore, setPublishedBefore] = useState<string | null>(null);
  const [publishedAfter, setPublishedAfter] = useState<string | null>(null);
  const [deprecationStatus, setDeprecationStatus] =
    useState<DeprecationStatus>("all");

  return (
    <Stack>
      <Title order={3}>Filters</Title>
      <InputWrapper label="Publication date">
        <Group>
          <DateInput
            value={publishedBefore}
            onChange={setPublishedBefore}
            placeholder="From"
            valueFormat="YYYY-MM-DD"
            w={125}
            clearable
          />
          <DateInput
            value={publishedAfter}
            onChange={setPublishedAfter}
            placeholder="To"
            valueFormat="YYYY-MM-DD"
            w={125}
            clearable
          />
        </Group>
      </InputWrapper>
      <InputWrapper label="Is deprecated">
        <div>
          <SegmentedControl
            value={deprecationStatus}
            onChange={setDeprecationStatus}
            fullWidth
            radius="sm"
            data={[
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Deprecated", value: "deprecated" },
            ]}
          />
        </div>
      </InputWrapper>
      <Group>
        <Button variant="filled" color="dark">
          Apply filters
        </Button>
        <Button variant="outline" color="dark">
          Reset
        </Button>
      </Group>
    </Stack>
  );
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <TextInput
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      radius="sm"
      placeholder="Search rubrics by title..."
    />
  );
}

interface ResultsListProps {
  /** Rubrics to display (already filtered) */
  rubrics: Rubric[];
  /** Full unfiltered list, used for title lookups */
  allRubrics: Rubric[];
}

function ResultsList({ rubrics, allRubrics }: ResultsListProps) {
  return (
    <Stack>
      {rubrics.map((rubric) => (
        <Card key={rubric.rubricID} shadow="xs" withBorder padding="lg">
          <ResultItem rubric={rubric} allRubrics={allRubrics} />
        </Card>
      ))}
    </Stack>
  );
}

type RubricStatus = "published" | "deprecated" | "draft";

function getRubricStatus(rubric: Rubric): RubricStatus {
  if (rubric.replacedByID !== null) return "deprecated";
  if (rubric.publicationDate !== null) return "published";
  return "draft";
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface ReplacementLinkProps {
  /** ID of the replacement rubric to link to */
  rubricID: string;
  /** Searched for the title before falling back to getRubric */
  allRubrics: Rubric[];
}

function ReplacementLink({ rubricID, allRubrics }: ReplacementLinkProps) {
  const localTitle = allRubrics.find((r) => r.rubricID === rubricID)?.title;
  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null);

  // Only fetch the title if it isn't in the local list
  useEffect(() => {
    if (localTitle !== undefined) return;
    let cancelled = false;

    const fetchTitle = async () => {
      const { result, error } = await getRubric(rubricID);
      if (error || cancelled) return;
      setFetchedTitle(result.title);
    };

    fetchTitle();

    return () => {
      cancelled = true;
    };
  }, [rubricID, localTitle]);

  return (
    <Anchor component={Link} href={`/rubrics?id=${rubricID}`}>
      {localTitle ?? fetchedTitle ?? rubricID}
    </Anchor>
  );
}

interface ResultItemProps {
  rubric: Rubric;
  /** Full unfiltered list, used to resolve the replacement rubric's title */
  allRubrics: Rubric[];
}

function ResultItem({ rubric, allRubrics }: ResultItemProps) {
  const status = getRubricStatus(rubric);
  const [duplicating, setDuplicating] = useState(false);
  const router = useRouter();

  const handleDuplicate = async () => {
    setDuplicating(true);
    const { result, error } = await duplicateRubric(rubric.rubricID);
    if (error) {
      setDuplicating(false);
      return;
    }
    // Duplicates are unpublished drafts, so the rubric page shows the editor
    router.push(`/rubrics/?id=${result.rubricID}`);
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Title order={5}>{rubric.title}</Title>
        <StatusBubble status={status} />
      </Group>
      <Stack gap={0}>
        <Text>Question count: {rubric.questionCount}</Text>
        {status !== "draft" && rubric.publicationDate && (
          <Text>Publication date: {formatDate(rubric.publicationDate)}</Text>
        )}
        {status === "deprecated" && rubric.replacedByID && (
          <Text>
            Replacement rubric:{" "}
            <ReplacementLink
              rubricID={rubric.replacedByID}
              allRubrics={allRubrics}
            />
          </Text>
        )}
      </Stack>
      <Group>
        <Button
          component={Link}
          href={`/rubrics/?id=${rubric.rubricID}`}
          variant="filled"
          color="dark"
        >
          View
        </Button>
        <Button
          variant="filled"
          color="dark"
          onClick={handleDuplicate}
          loading={duplicating}
        >
          Duplicate
        </Button>
      </Group>
    </Stack>
  );
}

function StatusBubble({
  status,
}: {
  status: "published" | "deprecated" | "draft" | null;
}) {
  switch (status) {
    case "published":
      return (
        <Badge color="green" variant="light">
          Published
        </Badge>
      );
    case "deprecated":
      return (
        <Badge color="gray" variant="light">
          Deprecated
        </Badge>
      );
    case "draft":
      return (
        <Badge color="orange" variant="light">
          Draft
        </Badge>
      );
    case null:
      return <></>;
  }
}
