import { request, type Result } from "./request";

// List rubrics

export interface ListRubricsFilters {
  deprecated?: boolean;
  publishedBefore?: Date;
  publishedAfter?: Date;
}

interface ListRubricsResponse {
  deprecated?: boolean;
  publishedBefore?: string;
  publishedAfter?: string;
  rubrics: {
    id: string;
    title: string;
    highQualityThreshold: number;
    lowQualityThreshold: number;
    questionCount: number;
    publicationDate: Date | null;
    replacedByID: string | null;
  }[];
}

export async function listRubrics({
  deprecated,
  publishedBefore,
  publishedAfter,
}: ListRubricsFilters): Promise<Result<ListRubricsResponse>> {
  return request<ListRubricsResponse>("GET", "/rubrics", {
    queryParams: {
      deprecated,
      publishedBefore: publishedBefore?.toISOString(),
      publishedAfter: publishedAfter?.toISOString(),
    },
  });
}

// Get rubric

interface GetRubricResponse {
  rubricID: string;
  designerID: string;
  title: string;
  highQualityThreshold: number;
  lowQualityThreshold: number;
  isFavorite: boolean;
  publicationDate: string | null;
  replacedByID: string | null;
  createdAt: string;
  questions: {
    section: number;
    index: number;
    question: string | null;
    scoreExplanations: string | null;
  }[];
}

export async function getRubric(
  rubricID: string,
): Promise<Result<GetRubricResponse>> {
  return request<GetRubricResponse>("GET", `/rubrics/${rubricID}`);
}

// Duplicate rubric

export interface DuplicateRubricResponse {
  rubricID: string;
  generatedFrom: string;
}

export async function duplicateRubric(
  rubricID: string,
): Promise<Result<DuplicateRubricResponse>> {
  return request<DuplicateRubricResponse>(
    "POST",
    `/rubrics/${rubricID}/duplicate`,
  );
}

// Deprecate rubric

export interface DeprecateRubricResult {
  rubricID: string;
  replacementID: string;
  deprecationDate: string;
}

export async function deprecateRubric(
  rubricID: string,
  replacementID: string,
): Promise<Result<DeprecateRubricResult>> {
  return request<DeprecateRubricResult>(
    "POST",
    `/rubrics/${rubricID}/deprecate`, {
    body: {
      replacementID: replacementID,
    }
  }
  );
}

