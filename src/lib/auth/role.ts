// AI disclosure: written by Kai (Claude Code, Claude Opus 5.5) on 2026-11-12 for
// issue #46, prompt: "implement #46 frontend login with Amplify Auth, plus an
// editor / rubric designer role choice at sign-up". See PR description.

import { fetchAuthSession, signUp, type SignUpInput } from "aws-amplify/auth";

/**
 * The role a user picks when they sign up. Decided in #backend (Nov 12): one
 * choice at sign-up, no Cognito groups.
 *  - journal_editor  -> gets a row in journal_designers
 *  - rubric_designer -> gets a row in rubric_designers
 */
export const ROLES = {
  journal_editor: "Journal editor",
  rubric_designer: "Rubric designer",
} as const;

export type SignUpRole = keyof typeof ROLES;

/**
 * Name of the sign-up form field. It's named like a Cognito custom attribute
 * so Amplify's Authenticator passes it through to handleSignUp. The user pool
 * has no custom:role attribute yet, so signUpWithRole strips it before calling
 * Cognito (see the PR for the open decision on where the role is stored).
 */
export const ROLE_FIELD = "custom:role";

const STORAGE_PREFIX = "raser.signUpRole.";

export function isSignUpRole(value: unknown): value is SignUpRole {
  return typeof value === "string" && value in ROLES;
}

function storageKey(email: string) {
  return STORAGE_PREFIX + email.trim().toLowerCase();
}

/** Remember the role picked at sign-up until the backend can record it. */
export function savePendingRole(email: string, role: SignUpRole) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(email), role);
}

export function getPendingRole(email: string): SignUpRole | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(storageKey(email));
  return isSignUpRole(role) ? role : null;
}

/** Call once the backend has stored the role (e.g. #77's ensure-user step). */
export function clearPendingRole(email: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(email));
}

/**
 * The signed-in user's role: the custom:role claim in the ID token if the
 * user pool ever gets that attribute, otherwise the role saved on this
 * browser at sign-up. Null if neither is known.
 */
export async function getCurrentUserRole(): Promise<SignUpRole | null> {
  const { tokens } = await fetchAuthSession();
  const claims = tokens?.idToken?.payload;
  const fromToken = claims?.[ROLE_FIELD];
  if (isSignUpRole(fromToken)) return fromToken;
  const email = claims?.email;
  return typeof email === "string" ? getPendingRole(email) : null;
}

/**
 * Replacement for the Authenticator's sign-up service. Takes the role out of
 * the Cognito attributes (the pool would reject an unknown attribute), saves
 * it locally, and sends it as clientMetadata so a Cognito trigger could read
 * it later if the team goes that way.
 */
export async function signUpWithRole(input: SignUpInput) {
  const { [ROLE_FIELD]: role, ...userAttributes } =
    input.options?.userAttributes ?? {};

  if (isSignUpRole(role)) savePendingRole(input.username, role);

  return signUp({
    ...input,
    options: {
      ...input.options,
      userAttributes,
      clientMetadata: {
        ...input.options?.clientMetadata,
        ...(isSignUpRole(role) ? { role } : {}),
      },
    },
  });
}
