"use client";

import { Journal, ErrorResponse } from "@/types/journals";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Group, Stack, Title, Text, Button, Loader } from "@mantine/core";
import { backend } from "@/axios-client";

export default function JournalsPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <JournalView />
    </Suspense>
  );
}

function JournalView() {
  const searchParams = useSearchParams();
  const journalID = searchParams.get("id"); // string | null

  const [journal, setJournal] = useState<Journal | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);

  // Retrieve journal info whenever journalID changes
  useEffect(() => {
    if (!journalID) return;
    let cancelled = false;

    // Fetch journal info
    backend
      .get<Journal>(`/journals/${journalID}`)
      .then((res) => {
        if (!cancelled) {
          setJournal(res.data);
        }
      })
      .catch((err) => {
        if (err.response && !cancelled) {
          setError(err.response);
        } else {
          console.log(`Unknown error on GET /journals/${journalID}`, err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [journalID]);

  function withdrawJournal() {
    // TODO: POST /journals/{journalID}/withdraw
    console.log(`Withdrawing journal ${journalID}`);
  }

  if (journalID === null) return <p>No journal selected.</p>; // TODO: list all public journals in this case
  if (error !== null) return <JournalNotFound journalID={journalID} />;
  if (journal === null) return <JournalLoading />;

  return (
    <div>
      <TitleRow
        journalName={journal.name}
        journalDescription={journal.description}
        handleWithdrawJournal={withdrawJournal}
      />
    </div>
  );
}

/**
 * A journal not found widget
 * @prop journalID - the attempted journal ID that was not found
 */
function JournalNotFound({ journalID }: { journalID: string }) {
  return (
    <Stack>
      <Title ta="center">Journal Not Found</Title>
      <Text c="dimmed" size="lg" ta="center">
        Journal with ID {journalID} does not exist.
      </Text>
      <Group justify="center">
        <Button variant="subtle" size="md" component={Link} href="/">
          Back to Dashboard
        </Button>
      </Group>
    </Stack>
  );
}

/**
 * A journal loading animation
 */
function JournalLoading() {
  return (
    <Stack h="100vh" align="center" justify="center">
      <Text size="xl">Loading journal...</Text>
      <Loader color="blue" type="oval" size="xl" />
    </Stack>
  );
}

interface TitleRowProps {
  journalName: string;
  journalDescription?: string;
  handleWithdrawJournal: () => void;
}

/**
 * Title row with a heading showing the name of the journal and subtext showing
 * the journal description (or generic text if there is no description). Also
 * has a button to withdraw the journal
 * @prop journalName -
 */
function TitleRow({
  journalName,
  journalDescription,
  handleWithdrawJournal,
}: TitleRowProps) {
  return (
    <Group justify="space-between" align="center">
      <Stack gap={4}>
        <Title order={2}>{journalName}</Title>
        <Text size="sm" c="dimmed">
          {journalDescription ??
            "Create an issue for each volume and number, then open it to add the papers that need review."}
        </Text>
      </Stack>

      <Button variant="outline" color="red" onClick={handleWithdrawJournal}>
        Withdraw Journal
      </Button>
    </Group>
  );
}
