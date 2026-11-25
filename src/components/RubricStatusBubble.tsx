import { Badge } from "@mantine/core";

/**
 * Colored bubble showing the status of a rubric
 */
export function RubricStatusBubble({
  status,
}: {
  status: "published" | "deprecated" | "draft" | "readonly" | null;
}) {
  switch (status) {
    case "published":
      return (
        <Badge color="green" variant="light">
          Published
        </Badge>
      );
    case "deprecated":
      return (
        <Badge color="gray" variant="light">
          Deprecated
        </Badge>
      );
    case "draft":
      return (
        <Badge color="orange" variant="light">
          Draft
        </Badge>
      );
    case "readonly":
      return (
        <Badge color="gray" variant="light">
          Read-only
        </Badge>
      );
    case null:
      return <></>;
  }
}
