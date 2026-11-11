import { Button, Container, Group, Text, Title } from "@mantine/core";
import classes from "./NotFoundPage.module.css";
import Link from "next/link";

interface NotFoundPageProps {
  titleText?: string;
  bodyText?: string;

  /** Path or URL to redirect the user to after clicking redirect button */
  redirectPath?: string;

  /** Text to show on the redirect button */
  redirectText?: string;
}

/**
 * Not found page that displays a help text.
 */
export function NotFoundPage({
  titleText = "The requested resource was not found.",
  bodyText = "Check the URL, or go back to another page.",
  redirectPath = "/",
  redirectText = "Back to dashboard",
}: NotFoundPageProps) {
  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}>{titleText}</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        {bodyText}
      </Text>
      <Group justify="center">
        <Button variant="subtle" size="md" component={Link} href={redirectPath}>
          {redirectText}
        </Button>
      </Group>
    </Container>
  );
}
