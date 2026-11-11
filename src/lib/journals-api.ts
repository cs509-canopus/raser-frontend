import { request, type Result } from "./request";

// List journals

interface ListJournalsResponse {
  journals: {
    id: string;
    name: string;
    description: string | null;
    issueCount: number;
  }[];
}

export async function listJournals(
  query: string,
): Promise<Result<ListJournalsResponse>> {
  return request<ListJournalsResponse>("GET", "/journals", {
    queryParams: {
      query,
    },
  });
}

// Get journal

interface GetJournalResponse {
  journalID: string;
  ownerID: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  coverImage?: string;
  createdAt: string;
  issues: {
    id: string;
  }[];
}

export async function getJournal(
  journalID: string,
): Promise<Result<GetJournalResponse>> {
  return request<GetJournalResponse>("GET", `/journals/${journalID}`);
}

// Create journal

interface JournalInfo {
  name: string;
  description?: string;
  websiteUrl?: string;
  coverImageUrl?: string;
}

interface CreateJournalResult {
  journalID: string;
  ownerID: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  coverImageUrl: string | null;
}

export async function createJournal(
  journalInfo: JournalInfo,
): Promise<Result<CreateJournalResult>> {
  return request<CreateJournalResult>("POST", "/journals", {
    body: journalInfo,
  });
}

// Withdraw journal

interface WithdrawJournalResponse {
  journalID: string;
}

export async function withdrawJournal(
  journalID: string,
): Promise<Result<WithdrawJournalResponse>> {
  return request<WithdrawJournalResponse>(
    "POST",
    `/journals/${journalID}/withdraw`,
  );
}
