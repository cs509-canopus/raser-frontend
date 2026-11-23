"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { RubricSearchPage } from "./search-page";
import { getRubric } from "@/lib/rubrics-api";
import { LoadingPage } from "@/components/LoadingPage";
import { RubricViewingPage } from "./viewing-page";
import { FullRubric } from "@/types";

export default function RubricPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <RubricView />
    </Suspense>
  );
}

function RubricView() {
  const searchParams = useSearchParams();
  const rubricID = searchParams.get("id"); // string | null

  const [rubric, setRubric] = useState<FullRubric | null>(null);
  const [fetchError, setFetchError] = useState("");

  // Retrieve rubric whenever rubricID changes
  useEffect(() => {
    if (!rubricID) return;
    let cancelled = false;

    const fetchRubric = async () => {
      const { result, error } = await getRubric(rubricID);
      if (error) {
        if (!cancelled && "data" in error) {
          setFetchError(error.data);
        }
        return;
      }

      setRubric({
        rubricID: result.rubricID,
        designerID: result.designerID,
        title: result.title,
        questions: result.questions,
        highQualityThreshold: result.highQualityThreshold,
        lowQualityThreshold: result.lowQualityThreshold,
        publicationDate:
          result.publicationDate !== null
            ? new Date(result.publicationDate)
            : null,
        isFavorite: result.isFavorite,
        replacedByID: result.replacedByID,
        createdAt: new Date(result.createdAt),
      });
    };

    fetchRubric();

    return () => {
      cancelled = true;
    };
  }, [rubricID]);

  // No ID provided: show search page
  if (rubricID === null) {
    return <RubricSearchPage />;
  }

  // Show error page if getRubric failed
  if (fetchError !== "") {
    return (
      <div>
        <h1>Failed to get rubric</h1>
      </div>
    );
  }

  // Rubric is published if the publication date is not null
  const rubricIsPublished = rubric?.publicationDate !== null;

  if (rubric === null) {
    return <LoadingPage loadingText="Loading rubric..." />;
  } else if (rubricIsPublished) {
    return <RubricViewingPage rubric={rubric} />;
  } else {
    // TODO: replace with actual page component
    return (
      <div>
        <h1>Rubric editing page</h1>
      </div>
    );
  }
}
