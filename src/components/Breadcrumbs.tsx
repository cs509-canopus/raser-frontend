import { Anchor, Breadcrumbs as MantineBreadcrumbs } from "@mantine/core";

interface BreadcrumbsProps {
  parts: {
    label: string;
    href?: string;
  }[]
}

export function Breadcrumbs({
  parts
}: BreadcrumbsProps) {
  const lastIdx = parts.length - 1

  return (
    <MantineBreadcrumbs separator=">" separatorMargin="md" mt="xs">
      {parts.map((part, idx) => (
        <Anchor key={idx} c={idx !== lastIdx ? "gray" : "dark"} href={part.href}>
          {part.label}
        </Anchor>
      ))}
    </MantineBreadcrumbs>
  )
}
