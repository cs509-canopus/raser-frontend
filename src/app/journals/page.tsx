"use client";

import { Journal, ErrorResponse } from "@/types/journals";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Group, Stack, Title, Text, Button, Loader, NumberInput, Paper, Container } from "@mantine/core";
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

  function createIssue(volumeNumber: number, issueNumber: number): string | undefined {
    // return "error";
    return undefined;
  }

  if (journalID === null) return <p>No journal selected.</p>; // TODO: list all public journals in this case
  if (error !== null) return <JournalNotFound journalID={journalID} />;
  if (journal === null) return <JournalLoading />;

  return (
    <Container fluid>
      <Stack>
        <TitleRow
          journalName={journal.name}
          journalDescription={journal.description}
          handleWithdrawJournal={withdrawJournal}
        />
        <Paper shadow="xs" withBorder p="xl">
          <CreateIssue
            handleCreateIssue={createIssue}/>
        </Paper>
      </Stack>
    </Container>
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

/**
 *
 */
function CreateIssue({
  handleCreateIssue,
}: {
  handleCreateIssue: (volumeNumber: number, issueNumber: number) => string | undefined
}) {
  const [volumeNumberValue, setVolumeNumberValue] = useState<number | string>(0);
  const [issueNumberValue, setIssueNumberValue] = useState<number | string>(0);
  const [inputError, setInputError] = useState<string>("");

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    // Prevent page reload
    event.preventDefault();

    const result = handleCreateIssue(Number(volumeNumberValue), Number(isSecureContext))

    // If result is defined, it is an error. Display that in the error text area
    setInputError(result !== undefined ? result : "")
  }

  return (
    <Stack gap="md">
      <Stack gap={0}>
        <Title order={4}>Create Issue</Title>
        <Text>An issue is identified by its volume and number.</Text>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Group>
          <NumberInput
            radius="sm"
            label="Volume"
            withAsterisk
            min={0}
            value={volumeNumberValue} 
            onChange={setVolumeNumberValue} />
          <NumberInput
            radius="sm"
            label="Issue"
            withAsterisk
            min={0}
            value={issueNumberValue} 
            onChange={setIssueNumberValue} />
          <Button variant="filled" color="dark" mt="auto" type="submit">
            Create Issue
          </Button>
        </Group>
      </form>
      <Text c="red">{inputError}</Text> 
    </Stack>
  )
}


