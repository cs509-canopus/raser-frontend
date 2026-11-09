"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Center, Loader } from "@mantine/core";
import { saveIdToken } from "@/axios-client";
import "@aws-amplify/ui-react/styles.css";

export default function LoginPage() {
  return (
    <Center mih="100vh">
      <Authenticator.Provider>
        <Authenticator>
          <LoggedIn />
        </Authenticator>
      </Authenticator.Provider>
    </Center>
  );
}

function LoggedIn() {
  const router = useRouter();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    saveIdToken().then(() => router.replace("/"));
  }, [authStatus, router]);

  return <Loader />;
}
