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
  highQualityThreshold: number;
  lowQualityThreshold: number;
  questionCount: number;
  publicationDate: Date | null;
  replacedByID: string | null;
}

/**
 * 
 */
export interface RubricQuestion {
  section: number;
  index: number;
  question: string | null;
  scoreExplanations: string | null;
}

/**
 * Full rubric with questions. Response body for GetRubric function at GET /rubrics/{rubricID}
 */
export interface FullRubric {
  rubricID: string;
  designerID: string;
  title: string;
  questions: RubricQuestion[];
  highQualityThreshold: number;
  lowQualityThreshold: number;
  publicationDate: Date | null;
  isFavorite: boolean;
  replacedByID: string | null;
  createdAt: Date;
}

export interface ErrorResponse {
  error: string;
}

