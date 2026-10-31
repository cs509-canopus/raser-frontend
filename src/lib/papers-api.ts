const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

export interface AddedPaper {
  journalID: string;
  issueID: string;
  paperID: string;
  title: string;
  authors: string[];
  publicationDate: string | null;
  paperUrl: string | null;
}

export interface PaperView {
  journalID: string;
  issueID: string;
  paperID: string;
  reviews: string[];
}

export class PapersApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new PapersApiError(body.error ?? res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

export interface AddPaperInput {
  title: string;
  authors?: string[];
  publicationDate?: string | null;
  paperUrl?: string | null;
}

export function addPaper(issueId: string, input: AddPaperInput): Promise<AddedPaper> {
  return request<AddedPaper>(`/issues/${issueId}/papers`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getPaper(paperId: string): Promise<PaperView> {
  return request<PaperView>(`/papers/${paperId}`);
}

export function withdrawPaper(paperId: string): Promise<{ paperID: string }> {
  return request(`/papers/${paperId}/withdraw`, { method: "POST" });
}
