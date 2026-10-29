"use client";

import { Journal, ErrorResponse } from "@/types/journals";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Group, Stack, Title, Text, Button } from "@mantine/core";
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

  if (!journalID) return <p>No journal selected.</p>;
  if (error) return <p>Couldn’t load journal: {error.error}</p>;
  if (!journal) return <p>Loading journal…</p>;

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
