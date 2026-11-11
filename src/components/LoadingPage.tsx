import {
  Loader,
  Stack,
  Text,
} from "@mantine/core";

interface LoadingPageProps {
  /** Text to show while the component is visible */
  loadingText?: string;
}

/**
 * A loading page that displays a loading animation with an optional loading text.
 */
export function LoadingPage({ loadingText }: LoadingPageProps) {
  return (
    <Stack h="100vh" align="center" justify="center">
      <Text size="xl">{loadingText}</Text>
      <Loader color="blue" type="oval" size="xl" />
    </Stack>
  );
}
