import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const ID_TOKEN_KEY = "idToken";

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

/**
 * Gets the current Cognito id token from Amplify and stores it in localStorage.
 */
export async function saveIdToken() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (token) {
    localStorage.setItem(ID_TOKEN_KEY, token);
  } else {
    clearIdToken();
  }
}

export function clearIdToken() {
  localStorage.removeItem(ID_TOKEN_KEY);
}

export function getIdToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ID_TOKEN_KEY);
}

backend.interceptors.request.use((config) => {
  const token = getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// token expired or missing, send the user back to log in (the login page
// refreshes the token if the amplify session is still valid)
backend.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      !window.location.pathname.startsWith("/login")
    ) {
      clearIdToken();
      window.location.href = "/login/";
    }
    return Promise.reject(error);
  },
);
