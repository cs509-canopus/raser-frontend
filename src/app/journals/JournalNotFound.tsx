import {
  Group,
  Stack,
  Title,
  Text,
  Button,
} from "@mantine/core";
import Link from "next/link";

/**
 * A journal not found widget
 * @prop journalID - the attempted journal ID that was not found
 */
export function JournalNotFound({ journalID }: { journalID: string }) {
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

