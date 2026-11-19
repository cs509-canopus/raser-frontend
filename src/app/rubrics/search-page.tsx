import {
  Badge,
  Button,
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
import { useState } from "react";

export function RubricSearchPage() {
  return (
    <Container fluid>
      <Stack>
        <Title>Browse Rubrics</Title>
        <Group align="flex-start">
          <Paper shadow="xs" withBorder p="lg" w={350}>
            <FiltersPanel />
          </Paper>
          <Stack w="Reviewers" style={{ flex: 1 }}>
            <SearchBar />
            <ResultsList />
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

function SearchBar({}) {
  const [searchInput, setSearchInput] = useState("");

  return (
    <TextInput
      value={searchInput}
      onChange={(event) => setSearchInput(event.currentTarget.value)}
      radius="sm"
      placeholder="Search rubrics by title..."
    />
  );
}

function ResultsList({}) {
  return (
    <Paper shadow="xs" withBorder p="lg">
      <ResultItem />;
    </Paper>
  )
}

function ResultItem({}) {
  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Title order={5}>Rubric name</Title>
        <StatusBubble status="deprecated" />
      </Group>
      <Stack gap={0}>
        <Text>Question count: </Text>
        <Text>Publication/Deprecation date: </Text>
        <Text>Replacement rubric: [link]</Text>
      </Stack>
      <Group>
        <Button variant="filled" color="dark">
          View
        </Button>
        <Button variant="filled" color="dark">
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
