import { request, type Result } from "./request";

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


