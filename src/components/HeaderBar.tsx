"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  Box,
  Button,
  Divider,
  Group,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { getCurrentUserRole, ROLES, type SignUpRole } from "@/lib/auth/role";

/**
 * Bar across the top of every signed-in page (#31): the RASER logo (links
 * back to the dashboard), the user's role, their email, and log out.
 */
export default function HeaderBar() {
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user]);
  const email = user?.signInDetails?.loginId ?? user?.username;
  const [role, setRole] = useState<SignUpRole | null>(null);

  // re-read whenever a different user signs in
  useEffect(() => {
    let cancelled = false;
    getCurrentUserRole()
      .then((r) => {
        if (!cancelled) setRole(r);
      })
      .catch(() => {
        if (!cancelled) setRole(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.userId]);

  return (
    <Box
      component="header"
      px="xl"
      py="sm"
      style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <UnstyledButton component={Link} href="/" aria-label="RASER home">
            <Group gap="sm" wrap="nowrap">
              <Logo />
              <Text fw={700} size="lg" style={{ letterSpacing: "0.04em" }}>
                RASER
              </Text>
            </Group>
          </UnstyledButton>
          {role && (
            <>
              <Divider orientation="vertical" />
              <Text size="sm" c="dimmed">
                {ROLES[role]}
              </Text>
            </>
          )}
        </Group>

        <Group gap="md" wrap="nowrap">
          <Text size="sm">{email}</Text>
          <Button size="xs" variant="default" radius="md" onClick={signOut}>
            Log out
          </Button>
        </Group>
      </Group>
    </Box>
  );
}

/** The "R" mark from the mockup. */
function Logo() {
  return (
    <Box
      w={28}
      h={28}
      bg="dark.7"
      c="white"
      fw={700}
      fz="sm"
      style={{
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden
    >
      R
    </Box>
  );
}
