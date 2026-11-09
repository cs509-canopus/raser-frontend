"use client";

import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { clearIdToken, saveIdToken } from "@/axios-client";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID ?? "",
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ?? "",
    },
  },
});

// keep the token in localStorage in sync when amplify refreshes or signs out
Hub.listen("auth", ({ payload }) => {
  if (payload.event === "tokenRefresh") {
    saveIdToken();
  } else if (payload.event === "signedOut") {
    clearIdToken();
  }
});

export default function ConfigureAmplify() {
  return null;
}
