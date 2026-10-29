"use client";

import styles from "./page.module.css";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Group, Stack, Title, Text, Button } from "@mantine/core";

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

  // TODO: get journal from the backend

  function withdrawJournal() {
    // TODO: POST /journals/{journalID}/withdraw
    console.log(`Withdrawing journal ${journalID}`)
  }

  return (
    <div>
      <TitleRow 
        journalName="Journal of the ACM"
        handleWithdrawJournal={withdrawJournal} />
    </div>
  );
}

interface TitleRowProps {
  journalName: string;
  journalDescription?: string;
  handleWithdrawJournal: () => void,
}

/**
 * Title row with a heading showing the name of the journal and subtext showing
 * the journal description (or generic text if there is no description). Also
 * has a button to withdraw the journal
 * @prop journalName -
 */
function TitleRow({ journalName, journalDescription, handleWithdrawJournal }: TitleRowProps) {
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
