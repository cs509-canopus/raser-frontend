// AI disclosure: the auth interceptors below were written by Kai (Claude Code,
// Claude Opus 5.5) on 2026-11-12 for issue #46, prompt: "wire axios-client.ts
// to attach the ID token via fetchAuthSession on every request". See PR.
import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Axios instance for interacting with the back-end API.
 */
export const backend = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});

// Attach the Cognito ID token to every request. Asking Amplify each time
// (instead of caching the string) means an expired token gets refreshed.
// The REST API's Cognito authorizer wants the ID token, sent as-is.
backend.interceptors.request.use(async (config) => {
  try {
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();
    if (idToken) config.headers.Authorization = idToken;
  } catch {
    // not signed in (or Amplify not configured, e.g. in tests): send as-is
  }
  return config;
});

// A 401 means the session is gone or invalid: go log in again.
backend.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !window.location.pathname.startsWith("/login")
    ) {
      // full page load on purpose: this runs outside React, so no router here
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login/");
    }
    return Promise.reject(error);
  },
);
