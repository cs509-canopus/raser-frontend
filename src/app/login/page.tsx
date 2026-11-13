"use client";
// AI disclosure: written by Kai (Claude Code, Claude Opus 5.5) on 2026-11-12 for
// issue #46, prompt: "build the login/sign-up page with Amplify's Authenticator
// and add an editor / rubric designer role choice to sign-up". See PR.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Authenticator,
  Radio,
  RadioGroupField,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import { Center, Loader } from "@mantine/core";
import "@aws-amplify/ui-react/styles.css";
import type { signUp } from "aws-amplify/auth";
import {
  ROLE_FIELD,
  ROLES,
  isSignUpRole,
  signUpWithRole,
} from "@/lib/auth/role";

const services = {
  // Amplify types handleSignUp with signUp's server-side overload too; we only
  // run in the browser, so the single-argument version is all that's called.
  handleSignUp: signUpWithRole as typeof signUp,
  async validateCustomSignUp(formData: Record<string, string>) {
    if (!isSignUpRole(formData[ROLE_FIELD])) {
      return { [ROLE_FIELD]: "Choose journal editor or rubric designer" };
    }
  },
};

const components = {
  SignUp: {
    FormFields() {
      return (
        <>
          <Authenticator.SignUp.FormFields />
          <RoleField />
        </>
      );
    },
  },
};

export default function LoginPage() {
  return (
    <Center mih="100vh">
      <Authenticator services={services} components={components}>
        <GoHome />
      </Authenticator>
    </Center>
  );
}

function RoleField() {
  const { validationErrors } = useAuthenticator((ctx) => [
    ctx.validationErrors,
  ]);
  const error = validationErrors[ROLE_FIELD];
  const message = Array.isArray(error) ? error.join(", ") : error;

  return (
    <RadioGroupField
      legend="I'm signing up as a"
      name={ROLE_FIELD}
      isRequired
      hasError={!!message}
      errorMessage={message}
    >
      {Object.entries(ROLES).map(([value, label]) => (
        <Radio key={value} value={value}>
          {label}
        </Radio>
      ))}
    </RadioGroupField>
  );
}

// Rendered by the Authenticator once signed in (including right after sign-up,
// since Amplify auto signs in after the email code is confirmed).
function GoHome() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return <Loader />;
}
