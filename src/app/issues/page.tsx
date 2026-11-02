"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Group,
  List,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import {
  addPaper,
  closePaper,
  getIssue,
  getPaper,
  type IssueView,
  type PaperView,
  PapersApiError,
} from "@/lib/papers-api";

type IssuePaper = Pick<PaperView, "paperID" | "title" | "authors">;

export default function IssuePage() {
  return (
    <Suspense>
      <IssueDetail />
    </Suspense>
  );
}

function IssueDetail() {
  const issueId = useSearchParams().get("id") ?? "";
  const [issue, setIssue] = useState<IssueView | null>(null);
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState<IssuePaper[]>([]);
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [error, setError] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getIssue(issueId)
      .then(async (i) => {
        if (cancelled) return;
        setIssue(i);
        // one GET per paper, no batch endpoint
        const results = await Promise.allSettled(
          i.papers.map((p) => getPaper(p.id)),
        );
        if (cancelled) return;
        const fetched: IssuePaper[] = results.map((r, idx) =>
          r.status === "fulfilled" ? r.value : { paperID: i.papers[idx].id },
        );
        // keep anything added while this was loading
        setPapers((prev) => [
          ...fetched,
          ...prev.filter((p) => !fetched.some((f) => f.paperID === p.paperID)),
        ]);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof PapersApiError ? err.message : "Failed to load issue",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [issueId]);

  const form = useForm({
    initialValues: {
      title: "",
      authors: "",
      publicationDate: null as string | null,
      paperUrl: "",
    },
    validate: {
      title: (value) =>
        value.trim().length === 0 ? "Title is required" : null,
    },
  });

  async function handleAddPaper(values: typeof form.values) {
    setError(null);
    try {
      const paper = await addPaper(issueId, {
        title: values.title,
        authors: values.authors
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        publicationDate: values.publicationDate || undefined,
        paperUrl: values.paperUrl.trim() || undefined,
      });
      setPapers((prev) =>
        prev.some((p) => p.paperID === paper.paperID) ? prev : [...prev, paper],
      );
      form.reset();
      closeModal();
    } catch (err) {
      setError(
        err instanceof PapersApiError ? err.message : "Failed to add paper",
      );
    }
  }

  async function handleClose(paperId: string) {
    setClosingId(paperId);
    setError(null);
    try {
      await closePaper(paperId);
      setClosedIds((prev) => new Set(prev).add(paperId));
    } catch (err) {
      setError(
        err instanceof PapersApiError ? err.message : "Failed to close paper",
      );
    } finally {
      setClosingId(null);
    }
  }

  return (
    <Stack p="lg" maw={720}>
      <Group justify="space-between">
        <Title order={2}>
          {issue
            ? `Volume ${issue.volumeNumber}, Issue ${issue.issueNumber}`
            : `Issue ${issueId}`}
        </Title>
        <Tooltip label="No DELETE /issues/{issueID} endpoint exists yet">
          <Button color="red" variant="outline" disabled>
            Delete issue
          </Button>
        </Tooltip>
      </Group>

      <Group justify="space-between" mt="md">
        <Title order={4}>Papers</Title>
        <Button onClick={openModal}>Add paper</Button>
      </Group>

      {error && <Text c="red">{error}</Text>}

      {loading && papers.length === 0 ? (
        <Loader />
      ) : papers.length === 0 ? (
        <Text c="dimmed" size="sm">
          No papers in this issue yet.
        </Text>
      ) : (
        <List spacing="sm" listStyleType="none">
          {papers.map((paper) => {
            const closed = closedIds.has(paper.paperID);
            return (
              <List.Item key={paper.paperID}>
                <Card withBorder padding="sm" radius="md">
                  <Group justify="space-between">
                    <div>
                      <Link href={`/papers?id=${paper.paperID}`}>
                        <Text fw={600}>
                          {paper.title?.trim() || `Paper ${paper.paperID}`}
                        </Text>
                      </Link>
                      {paper.authors && (
                        <Text size="xs" c="dimmed">
                          {paper.authors.join(", ") || "No authors listed"}
                        </Text>
                      )}
                    </div>
                    <Group>
                      <Badge color={closed ? "red" : "green"}>
                        {closed ? "Closed" : "Active"}
                      </Badge>
                      <Button
                        size="xs"
                        color="red"
                        variant="outline"
                        disabled={closed}
                        loading={closingId === paper.paperID}
                        onClick={() => handleClose(paper.paperID)}
                      >
                        Close
                      </Button>
                    </Group>
                  </Group>
                </Card>
              </List.Item>
            );
          })}
        </List>
      )}

      <Modal opened={modalOpened} onClose={closeModal} title="Add paper">
        <form onSubmit={form.onSubmit(handleAddPaper)}>
          <Stack>
            <TextInput
              label="Title"
              required
              {...form.getInputProps("title")}
            />
            <TextInput
              label="Authors"
              description="Comma-separated, optional"
              {...form.getInputProps("authors")}
            />
            <DateInput
              label="Publication date"
              description="Optional"
              valueFormat="YYYY-MM-DD"
              clearable
              {...form.getInputProps("publicationDate")}
            />
            <TextInput
              label="Paper URL"
              description="Optional"
              {...form.getInputProps("paperUrl")}
            />
            <Group justify="flex-end">
              <Button type="submit">Add</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
