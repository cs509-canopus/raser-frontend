"use client";

import { Journal, Issue, ErrorResponse } from "@/types";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Group, Stack, Title, Text, Button, Loader, NumberInput, Paper, Container, Table } from "@mantine/core";
import { backend } from "@/axios-client";
import { AxiosError } from "axios";

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

  async function createIssue(volumeNumber: number, issueNumber: number): Promise<string | undefined> {
    try {
      if (journal === null) return;

      // Issue request to create issue under this journal
      const res = await backend.post<Issue>(`/journals/${journalID}/issues`, {
        volumeNumber, issueNumber
      });
      
      // Add issueID to the journal
      const newIssueID = res.data.issueID
      setJournal(journal => { 
        if (!journal) return journal;
        return {
          ...journal,
          issues: [...journal.issues, { id: newIssueID }],
        }
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        return err.response.data.error
      } else {
        console.log(`Unknown error on POST /journals/${journalID}/issues`, err);
      }
    }

    return undefined;
  }

  if (journalID === null) return <p>No journal selected.</p>; // TODO: list all public journals in this case
  if (error !== null) return <JournalNotFound journalID={journalID} />;
  if (journal === null) return <JournalLoading />;

  console.log("Journal:", journal)

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
        <Paper shadow="xs" withBorder p="xl">
          <Stack gap="sm">
            <Title order={4}>Issues</Title>
            <IssueTable issueIDs={journal.issues.map(i => i.id)} />
          </Stack>
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
  handleCreateIssue: (volumeNumber: number, issueNumber: number) => Promise<string | undefined>
}) {
  const [volumeNumberValue, setVolumeNumberValue] = useState<number | string>(0);
  const [issueNumberValue, setIssueNumberValue] = useState<number | string>(0);
  const [inputError, setInputError] = useState<string>("");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    // Prevent page reload
    event.preventDefault();

    const result = await handleCreateIssue(Number(volumeNumberValue), Number(issueNumberValue))

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

/**
 * A table containing each of the issues in `issueIDs`.
 * @prop issueIDs - IDs of the issues to render
 */
function IssueTable({ issueIDs }: { issueIDs: string[] }) {
  const [issues, setIssues] = useState<Issue[]>([])

  function handleDelete(issueID: string) {
    console.log(`Deleting issue ${issueID}`);
    // TODO: call DELETE /issues/{issueID}
  }

  // Fetch the full issue for each of the issues
  useEffect(() => {
    let cancelled = false;
    setIssues([]);

    for (const issueID of issueIDs) {
      // Fetch issue info
      backend
        .get<Issue>(`/issues/${issueID}`)
        .then((res) => {
          if (!cancelled) {
            setIssues(prev => [...prev, res.data]);
          }
        })
        .catch((err) => {
          // Skip adding this issue
          console.log(`Unknown error on GET /issues/${issueID}`, err);
          console.log(`Skipping adding issue ${issueID}`);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [issueIDs])

  // Order by volume number then issue number
  issues.sort((a, b) => (a.volumeNumber - b.volumeNumber) || (a.issueNumber - b.issueNumber));

  // Create table rows out of each issue
  const tableRows = issues.map((issue) => (
    <Table.Tr key={issue.issueID}>
      <Table.Td>Vol. {issue.volumeNumber}, No. {issue.issueNumber}</Table.Td>
      <Table.Td ta="center">{issue.papers.length}</Table.Td>
      <Table.Td ta="center">0</Table.Td>
      <Table.Td ta="center">Status</Table.Td>
      <Table.Td ta="right">
        <Group justify="flex-end">
          <Button variant="outline" color="dark" component={Link} href={`/issues/?id=${issue.issueID}`}>Open</Button>
          <Button variant="outline" color="red" onClick={() => handleDelete(issue.issueID)}>Delete</Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Issue</Table.Th>
          <Table.Th ta="center">Papers</Table.Th>
          <Table.Th ta="center">Reviewers Assigned</Table.Th>
          <Table.Th ta="center">Status</Table.Th>
          <Table.Th ta="right">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {tableRows}
      </Table.Tbody>
    </Table>
  );
}

