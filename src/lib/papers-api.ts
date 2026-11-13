// AI disclosure: request() was switched from fetch to the shared axios
// instance by Kai (Claude Code, Claude Opus 5.5) on 2026-11-12 for issue #46,
// so paper calls carry the login token. Prompt: "implement #46 frontend login".
import axios from "axios";
import { backend } from "@/axios-client";

export interface AddedPaper {
  journalID: string;
  issueID: string;
  paperID: string;
  title: string;
  authors: string[];
  publicationDate: string | null;
  paperUrl: string | null;
}

// GET /papers/{paperID}, new fields from backend #49
export interface PaperView {
  journalID: string;
  issueID: string;
  paperID: string;
  title?: string;
  isClosed: boolean;
  authors?: string[];
  publicationDate?: string | null;
  paperUrl?: string | null;
  reviews: string[];
}

// GET /issues/{issueID}, papers are the raw `SELECT id` rows
export interface IssueView {
  journalID: string;
  issueID: string;
  volumeNumber: number;
  issueNumber: number;
  createdAt: string;
  papers: { id: string }[];
}

export class PapersApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: string;
  body?: string;
}

// Goes through the shared axios instance so the Cognito token gets attached.
async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  try {
    const res = await backend.request<T>({
      url: path,
      method: init?.method ?? "GET",
      data: init?.body,
    });
    return res.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      const body = e.response.data as { error?: string } | undefined;
      throw new PapersApiError(
        body?.error ?? e.response.statusText,
        e.response.status,
      );
    }
    throw e;
  }
}

export interface AddPaperInput {
  title: string;
  authors?: string[];
  publicationDate?: string | null;
  paperUrl?: string | null;
}

export function addPaper(
  issueId: string,
  input: AddPaperInput,
): Promise<AddedPaper> {
  return request<AddedPaper>(`/issues/${issueId}/papers`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getIssue(issueId: string): Promise<IssueView> {
  return request<IssueView>(`/issues/${issueId}`);
}

export function deleteIssue(issueId: string): Promise<IssueView> {
  return request<{ issueID: string }>(`/issues/${issueId}`, { method: "DELETE"});
}

export function getPaper(paperId: string): Promise<PaperView> {
  return request<PaperView>(`/papers/${paperId}`);
}

export function closePaper(paperId: string): Promise<{ paperID: string }> {
  return request(`/papers/${paperId}/close`, { method: "POST" });
}
