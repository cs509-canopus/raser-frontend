"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Amplify } from "aws-amplify";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Center, Loader } from "@mantine/core";
import HeaderBar from "@/components/HeaderBar";

// Without these nobody can log in, and every page just redirects to /login.
if (
  !process.env.NEXT_PUBLIC_USER_POOL_ID ||
  !process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID
) {
  console.error(
    "NEXT_PUBLIC_USER_POOL_ID / NEXT_PUBLIC_USER_POOL_CLIENT_ID are not set, so login won't work. See the README.",
  );
}

// Runs once in the browser when this module loads, before anything below
// calls Amplify. Tokens are kept in localStorage (Amplify's default).
// User pool only, no identity pool: we only call our own API Gateway.
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID ?? "",
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ?? "",
      loginWith: { email: true },
      signUpVerificationMethod: "code",
      userAttributes: { email: { required: true } },
    },
  },
});

function isLoginPath(pathname: string | null) {
  return pathname?.startsWith("/login") ?? false;
}

/**
 * Wraps the whole app. Shares one Amplify auth state with every page, sends
 * logged-out users to /login, and shows the header bar when logged in.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Authenticator.Provider>
      <AuthGuard>{children}</AuthGuard>
    </Authenticator.Provider>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
  const onLoginPage = isLoginPath(pathname);

  useEffect(() => {
    if (authStatus === "unauthenticated" && !onLoginPage) {
      router.replace("/login/");
    }
  }, [authStatus, onLoginPage, router]);

  if (onLoginPage) return <>{children}</>;

  // Don't render pages (and fire API calls) until we know there's a user.
  if (authStatus !== "authenticated") {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <HeaderBar />
      {children}
    </>
  );
}
