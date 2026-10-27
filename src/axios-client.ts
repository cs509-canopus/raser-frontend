import "dotenv/config";
import axios from "axios";

/**
 * Axios instance for interacting with the back-end API.
 */
export const backend = axios.create({
  baseURL: process.env.BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});
