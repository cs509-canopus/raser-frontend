"use client";

// no GET /issues/{issueID} yet, so issue info is just the url param and
// papers is local state only, seeded from add-paper responses
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Group,
  List,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import {
  addPaper,
  withdrawPaper,
  type AddedPaper,
  PapersApiError,
} from "@/lib/papers-api";

export default function IssuePage() {
  const { issueId } = useParams<{ issueId: string }>();
  const [papers, setPapers] = useState<AddedPaper[]>([]);
  const [withdrawnIds, setWithdrawnIds] = useState<Set<string>>(new Set());
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const form = useForm({
    initialValues: { title: "", authors: "" },
    validate: {
      title: (value) => (value.trim().length === 0 ? "Title is required" : null),
    },
  });

  async function handleAddPaper(values: { title: string; authors: string }) {
    setError(null);
    try {
      const paper = await addPaper(issueId, {
        title: values.title,
        authors: values.authors
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      });
      setPapers((prev) => [...prev, paper]);
      form.reset();
      closeModal();
    } catch (err) {
      setError(err instanceof PapersApiError ? err.message : "Failed to add paper");
    }
  }

  async function handleWithdraw(paperId: string) {
    setWithdrawingId(paperId);
    setError(null);
    try {
      await withdrawPaper(paperId);
      setWithdrawnIds((prev) => new Set(prev).add(paperId));
    } catch (err) {
      setError(err instanceof PapersApiError ? err.message : "Failed to withdraw paper");
    } finally {
      setWithdrawingId(null);
    }
  }

  return (
    <Stack p="lg" maw={720}>
      <Group justify="space-between">
        <Title order={2}>Issue {issueId}</Title>
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

      {papers.length === 0 ? (
        <Text c="dimmed" size="sm">
          No papers added yet this session.
        </Text>
      ) : (
        <List spacing="sm" listStyleType="none">
          {papers.map((paper) => {
            const closed = withdrawnIds.has(paper.paperID);
            return (
              <List.Item key={paper.paperID}>
                <Card withBorder padding="sm" radius="md">
                  <Group justify="space-between">
                    <div>
                      <Link href={`/papers/${paper.paperID}`}>
                        <Text fw={600}>{paper.title}</Text>
                      </Link>
                      <Text size="xs" c="dimmed">
                        {paper.authors.join(", ") || "No authors listed"}
                      </Text>
                    </div>
                    <Group>
                      <Badge color={closed ? "red" : "green"}>
                        {closed ? "Withdrawn" : "Active"}
                      </Badge>
                      <Button
                        size="xs"
                        color="red"
                        variant="outline"
                        disabled={closed}
                        loading={withdrawingId === paper.paperID}
                        onClick={() => handleWithdraw(paper.paperID)}
                      >
                        Withdraw
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
            <Group justify="flex-end">
              <Button type="submit">Add</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
