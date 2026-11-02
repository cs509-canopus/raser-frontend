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
  Stack,
  Text,
  Title,
} from "@mantine/core";
import dayjs from "dayjs";
import {
  closePaper,
  getPaper,
  type PaperView,
  PapersApiError,
} from "@/lib/papers-api";

export default function PaperPage() {
  return (
    <Suspense>
      <PaperDetail />
    </Suspense>
  );
}

function PaperDetail() {
  const paperId = useSearchParams().get("id") ?? "";
  const [paper, setPaper] = useState<PaperView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPaper(paperId)
      .then((p) => {
        if (!cancelled) setPaper(p);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof PapersApiError ? err.message : "Failed to load paper",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [paperId]);

  async function handleClose() {
    setClosing(true);
    setError(null);
    try {
      await closePaper(paperId);
      setClosed(true);
    } catch (err) {
      setError(
        err instanceof PapersApiError ? err.message : "Failed to close paper",
      );
    } finally {
      setClosing(false);
    }
  }

  if (error && !paper) {
    return (
      <Stack p="lg">
        <Text c="red">{error}</Text>
      </Stack>
    );
  }

  if (!paper) {
    return (
      <Stack p="lg" align="center">
        <Loader />
      </Stack>
    );
  }

  const title = paper.title?.trim() || `Paper ${paper.paperID}`;
  const pdfUrl = paper.paperUrl?.trim() || null;
  const publicationDate = formatPublicationDate(paper.publicationDate);
  // authors undefined until backend #49 is deployed
  const authors = paper.authors
    ? paper.authors.join(", ") || "No authors listed"
    : null;
  const details = [authors, publicationDate].filter(Boolean).join(" · ");

  return (
    <Stack p="lg" maw={960}>
      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Group gap="sm" align="center">
              <Title order={2}>{title}</Title>
              <Badge variant="light" color={closed ? "red" : "green"}>
                {closed ? "Closed" : "Active"}
              </Badge>
            </Group>
            {details && (
              <Text size="sm" c="dimmed">
                {details}
              </Text>
            )}
          </Stack>

          <Group gap="sm" wrap="nowrap">
            {pdfUrl && (
              <Button
                component="a"
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="default"
              >
                Preview PDF
              </Button>
            )}
            <Button
              color="red"
              variant="outline"
              disabled={closed}
              loading={closing}
              onClick={handleClose}
            >
              {closed ? "Closed" : "Close paper"}
            </Button>
          </Group>
        </Group>

        <List mt="md" spacing="xs" size="sm">
          <List.Item>Issue: {paper.issueID}</List.Item>
          <List.Item>Journal: {paper.journalID}</List.Item>
          <List.Item>
            Reviews:{" "}
            {paper.reviews.length > 0 ? paper.reviews.join(", ") : "None yet"}
          </List.Item>
        </List>

        {error && (
          <Text c="red" size="sm" mt="sm">
            {error}
          </Text>
        )}
      </Card>
    </Stack>
  );
}

// date only, avoids tz shift
function formatPublicationDate(value?: string | null): string | null {
  if (!value) return null;
  const datePart = /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0];
  if (!datePart) return value;
  const date = dayjs(datePart);
  return date.isValid() ? date.format("MMM D, YYYY") : value;
}
