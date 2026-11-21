import { request, type Result } from "./request";

// Get issue

interface GetIssueResponse {
  journalID: string;
  issueID: string;
  volumeNumber: number;
  issueNumber: number;
  createdAt: Date;
  papers: string[];
}

export async function getIssue(
  issueID: string,
): Promise<Result<GetIssueResponse>> {
  return request<GetIssueResponse>("GET", `/issues/${issueID}`);
}

// Create issue

interface IssueInfo {
  volumeNumber: number;
  issueNumber: number;
}

interface CreateIssueResult {
  issueID: string;
  volumeNumber: number;
  issueNumber: number;
  createdAt: Date;
  papers: []; // empty list
}

export async function createIssue(
  journalID: string,
  issueInfo: IssueInfo,
): Promise<Result<CreateIssueResult>> {
  return request<CreateIssueResult>("POST", `/journals/${journalID}/issues`, {
    body: issueInfo,
  });
}

// Delete issue

interface DeleteIssueResponse {
  issueID: string;
}

export async function deleteIssue(
  issueID: string,
): Promise<Result<DeleteIssueResponse>> {
  return request<DeleteIssueResponse>("DELETE", `/issues/${issueID}`);
}
