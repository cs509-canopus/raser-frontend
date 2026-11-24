"use client";

import { Journal, Issue } from "@/types";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Group,
  Stack,
  Title,
  Text,
  Button,
  NumberInput,
  Paper,
  Container,
  Table,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { LoadingPage } from "@/components/LoadingPage";
import { NotFoundPage } from "@/components/NotFoundPage";
import { getJournal, withdrawJournal } from "@/lib/journals-api";
import { createIssue, deleteIssue, getIssue } from "@/lib/issues-api";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import router from "next/router";
import { Breadcrumbs } from "@/components/Breadcrumbs";

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
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string>("");

  // Retrieve journal and issues info whenever journalID changes
  useEffect(() => {
    if (!journalID) return;
    let cancelled = false;

    const fetchAllData = async () => {
      // Get journal info
      const { result, error } = await getJournal(journalID);
      if (error) {
        if (!cancelled && "data" in error) {
          setError(error.data);
        }
        return;
      }

      setJournal({
        journalID: result.journalID,
        createdAt: new Date(result.createdAt),
        name: result.name,
        description: result.description,
        websiteUrl: result.websiteUrl,
        coverImage: result.coverImage,
        issues: result.issues,
      });

      // Get info about every issue in the journal
      const fetchedIssues = await Promise.all(
        result.issues.map(async ({ id: issueID }) => {
          const { result: issueResponse, error: issueError } =
            await getIssue(issueID);
          if (issueError) {
            if (!cancelled && "data" in issueError) {
              setError(issueError.data);
            }
          }

          return issueResponse;
        }),
      );

      // Filter out undefined values
      setIssues(fetchedIssues.filter((issue) => issue !== undefined));
    };

    fetchAllData();

    return () => {
      cancelled = true;
    };
  }, [journalID]);

  async function handleWithdrawJournal() {
    if (journal === null || journalID === null) return;

    const result = await withdrawJournal(journalID);
    if (result.error) {
      console.warn(`Error withdrawing journal ${journalID}: ${result.error}`);
      return;
    }

    setJournal(null);

    // Redirect to dashboard
    router.push("/");
  }

  async function handleCreateIssue(
    volumeNumber: number,
    issueNumber: number,
  ): Promise<string | undefined> {
    if (journal === null || journalID === null) return;

    const { result, error } = await createIssue(journalID, {
      volumeNumber,
      issueNumber,
    });
    if (error) {
      if ("data" in error) {
        return error.data;
      } else {
        return error.cause;
      }
    }

    // Add new issueID to the journal
    setJournal((journal) => {
      if (journal === null) return journal;
      return {
        ...journal,
        issues: [...journal.issues, { id: result.issueID }],
      };
    });

    // Add new issue to the list of issues
    setIssues((prev) => [
      ...prev,
      {
        journalID,
        ...result,
      },
    ]);

    // No error
    return undefined;
  }

  async function handleDeleteIssue(issueID: string) {
    const { result, error } = await deleteIssue(issueID);
    if (error) {
      return;
    }

    // Remove issueID from the journal
    setJournal((journal) => {
      if (journal === null) return journal;
      return {
        ...journal,
        issues: journal.issues.filter((issue) => issue.id !== result.issueID),
      };
    });

    // Remove issue from the list of issues
    setIssues((prev) =>
      prev.filter((issue) => issue.issueID != result.issueID),
    );
  }

  if (journalID === null) return <p>No journal selected.</p>;
  if (error !== "") {
    return (
      <NotFoundPage
        titleText="Journal not found."
        bodyText="The requested journal does not exist under your account. Try checking the URL, or go back to the dashboard."
      />
    );
  }
  if (journal === null || issues.length < journal.issues.length)
    return <LoadingPage loadingText="Loading journal..." />;

  console.log("Journal:", journal);

  const breadcrumbParts = [
    {
      label: "Journals",
    },
    {
      label: journal.name,
      href: `/journals/?id=${journal.journalID}`,
    },
  ];

  return (
    <Container fluid>
      <Stack>
        <Breadcrumbs parts={breadcrumbParts} />
        <TitleRow
          journalName={journal.name}
          journalDescription={journal.description}
          handleWithdrawJournal={handleWithdrawJournal}
        />
        <Paper shadow="xs" withBorder p="xl">
          <CreateIssue handleCreateIssue={handleCreateIssue} />
        </Paper>
        <Paper shadow="xs" withBorder p="xl">
          <Stack gap="sm">
            <Group gap="xs" align="center">
              <Title order={4}>Issues</Title>
              <Badge color="gray" variant="light">
                {issues.length}
              </Badge>
            </Group>
            <IssueTable issues={issues} handleDeleteIssue={handleDeleteIssue} />
          </Stack>
        </Paper>
      </Stack>
    </Container>
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
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <Stack gap={4}>
        <Title order={2}>{journalName}</Title>
        <Text size="sm" c="dimmed">
          {journalDescription ??
            "Create an issue for each volume and number, then open it to add the papers that need review."}
        </Text>
      </Stack>

      <Button
        variant="outline"
        color="red"
        miw="fit-content"
        onClick={openModal}
      >
        Withdraw Journal
      </Button>

      <ConfirmationModal
        opened={modalOpened}
        closeModal={closeModal}
        action={handleWithdrawJournal}
        infoText="Withdrawing a journal deletes all issues, papers, and reviews associated with the journal. This is a destructive action and cannot be undone!"
        confirmationText={journalName}
      />
    </Group>
  );
}

/**
 *
 */
function CreateIssue({
  handleCreateIssue,
}: {
  handleCreateIssue: (
    volumeNumber: number,
    issueNumber: number,
  ) => Promise<string | undefined>;
}) {
  const [volumeNumberValue, setVolumeNumberValue] = useState<number | string>(
    1,
  );
  const [issueNumberValue, setIssueNumberValue] = useState<number | string>(1);
  const [inputError, setInputError] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    // Prevent page reload
    event.preventDefault();

    // Disable create button while the issue is being created.
    setIsCreating(true);
    const result = await handleCreateIssue(
      Number(volumeNumberValue),
      Number(issueNumberValue),
    );
    setIsCreating(false);

    // If result is defined, it is an error. Display that in the error text area
    if (result !== undefined) {
      setInputError(result);
      return;
    }

    // Reset field values and error text
    setIssueNumberValue(0);
    setVolumeNumberValue(0);
    setInputError("");
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
            min={1}
            value={volumeNumberValue}
            onChange={setVolumeNumberValue}
          />
          <NumberInput
            radius="sm"
            label="Issue"
            withAsterisk
            min={1}
            value={issueNumberValue}
            onChange={setIssueNumberValue}
          />
          <Button
            variant="filled"
            color="dark"
            mt="auto"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Issue"}
          </Button>
        </Group>
      </form>
      <Text c="red">{inputError}</Text>
    </Stack>
  );
}

interface IssueTableProps {
  issues: Issue[];
  handleDeleteIssue: (issue: string) => void;
}

/**
 * A table containing each of the issues in `issues`.
 * @prop issues - the issues to render
 */
function IssueTable({ issues, handleDeleteIssue }: IssueTableProps) {
  // Order by volume number then issue number
  issues.sort(
    (a, b) => a.volumeNumber - b.volumeNumber || a.issueNumber - b.issueNumber,
  );

  const tableRows = issues.map((issue) => (
    <IssueTableRow
      key={issue.issueID}
      issue={issue}
      handleDelete={() => handleDeleteIssue(issue.issueID)}
    />
  ));

  return (
    <Table>
      <Table.Thead
        style={{
          backgroundColor:
            "light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-6))",
        }}
      >
        <Table.Tr>
          <Table.Th>Issue</Table.Th>
          <Table.Th ta="left">Papers</Table.Th>
          <Table.Th ta="left">Reviewers Assigned</Table.Th>
          <Table.Th ta="left">Status</Table.Th>
          <Table.Th ta="right">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{tableRows}</Table.Tbody>
    </Table>
  );
}

function IssueTableRow({
  issue,
  handleDelete,
}: {
  issue: Issue;
  handleDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  function handleClick() {
    handleDelete();

    // Disables the delete button while the issue is being deleted. Prevents
    // user from sending multiple delete requests
    setIsDeleting(true);
  }

  // TODO: update to include under-review and reviews-done status
  const issueStatus =
    issue.papers.length === 0 ? "no-papers" : "awaiting-reviewers";

  return (
    <Table.Tr key={issue.issueID}>
      <Table.Td>
        Vol. {issue.volumeNumber}, No. {issue.issueNumber}
      </Table.Td>
      <Table.Td ta="left">{issue.papers.length}</Table.Td>
      <Table.Td ta="left">0</Table.Td>
      <Table.Td ta="left">
        <IssueStatusBubble status={issueStatus} />
      </Table.Td>
      <Table.Td ta="right">
        <Group justify="flex-end">
          <Button
            variant="outline"
            color="dark"
            component={Link}
            href={`/issues/?id=${issue.issueID}`}
          >
            Open
          </Button>
          <Button
            variant="outline"
            color="red"
            disabled={issue.papers.length > 0 || isDeleting}
            onClick={handleClick}
          >
            Delete
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

function IssueStatusBubble({
  status,
}: {
  status:
    "no-papers" | "awaiting-reviewers" | "under-review" | "reviews-done" | null;
}) {
  switch (status) {
    case "no-papers":
      return (
        <Badge color="gray" variant="light">
          No Papers
        </Badge>
      );
    case "awaiting-reviewers":
      return (
        <Badge color="gray" variant="light">
          Awaiting Reviewers
        </Badge>
      );
    case "under-review":
      return (
        <Badge color="blue" variant="light">
          Under Review
        </Badge>
      );
    case "reviews-done":
      return (
        <Badge color="green" variant="light">
          Reviews Done
        </Badge>
      );
    case null:
      return <></>;
  }
}
