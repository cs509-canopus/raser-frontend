import {
  Loader,
  Stack,
  Text,
} from "@mantine/core";

/**
 * A journal loading animation
 */
export function JournalLoading() {
  return (
    <Stack h="100vh" align="center" justify="center">
      <Text size="xl">Loading journal...</Text>
      <Loader color="blue" type="oval" size="xl" />
    </Stack>
  );
}

