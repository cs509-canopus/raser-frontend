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
  issues: string[];
}

export interface ErrorResponse {
  error: string;
}
