/**
 * Response body for GetJournal lambda function at GET /journals/{journalID} on HTTP 200
 */
export interface Journal {
  journalID: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  coverImage?: string;
  createdAt: Date;
  issues: { id: string }[];
}

/**
 * Response body for GetIssue lambda function at GET /issue/{issueID} on HTTP 200
 */
export interface Issue {
  journalID: string;
  issueID: string;
  volumeNumber: number;
  issueNumber: number;
  createdAt: Date;
  papers: string[];
}

/**
 * Rubric summary displayed on the rubric search page
 */
export interface Rubric {
  rubricID: string;
  title: string;
  highQualityThreshold: number;
  lowQualityThreshold: number;
  questionCount: number;
  publicationDate: Date | null;
  replacedByID: string | null;
}

export interface ErrorResponse {
  error: string;
}
