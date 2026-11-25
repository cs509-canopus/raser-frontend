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
 * Response body for GetIssue lambda function at GET /rubric/{rubricID} on HTTP 200
 */
export interface Rubric {
  rubricID: string;
  title: string;
  highScoreThreshold: number;
  lowScoreThreshold: number;
  publicationDate: Date | null;
  isFavorite: boolean;
  replacedByID: string | null;
  createdAt: Date;

}

export interface RubricQuestion {
  section: number;
  index: number;
  question: string;
  scoreExplanations: string[];
}

export interface ErrorResponse {
  error: string;
}
