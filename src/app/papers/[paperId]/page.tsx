"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { getPaper, withdrawPaper, type PaperView, PapersApiError } from "@/lib/papers-api";

export default function PaperPage() {
  const { paperId } = useParams<{ paperId: string }>();
  const [paper, setPaper] = useState<PaperView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPaper(paperId)
      .then((p) => {
        if (!cancelled) setPaper(p);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof PapersApiError ? err.message : "Failed to load paper");
      });
    return () => {
      cancelled = true;
    };
  }, [paperId]);

  async function handleWithdraw() {
    setWithdrawing(true);
    setError(null);
    try {
      await withdrawPaper(paperId);
      setWithdrawn(true);
    } catch (err) {
      setError(err instanceof PapersApiError ? err.message : "Failed to withdraw paper");
    } finally {
      setWithdrawing(false);
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

  return (
    <Stack p="lg" maw={640}>
      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" align="flex-start">
          <Title order={2}>Paper {paper.paperID}</Title>
          <Badge color={withdrawn ? "red" : "green"}>
            {withdrawn ? "Withdrawn" : "Active"}
          </Badge>
        </Group>

        <List mt="md" spacing="xs" size="sm">
          <List.Item>Issue: {paper.issueID}</List.Item>
          <List.Item>Journal: {paper.journalID}</List.Item>
          <List.Item>
            Reviews: {paper.reviews.length > 0 ? paper.reviews.join(", ") : "None yet"}
          </List.Item>
        </List>

        {error && (
          <Text c="red" size="sm" mt="sm">
            {error}
          </Text>
        )}

        <Group mt="lg">
          <Button
            color="red"
            variant="outline"
            disabled={withdrawn}
            loading={withdrawing}
            onClick={handleWithdraw}
          >
            {withdrawn ? "Withdrawn" : "Withdraw paper"}
          </Button>
        </Group>
      </Card>
    </Stack>
  );
}
