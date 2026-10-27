"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { backend } from "@/axios-client";

export default function Home() {
  // Get ID of the journal being viewed
  const { journalId } = useParams<{ journalId: string }>();

  useEffect(() => {
    // backend.get(`/journals/${journalId}`).then(() => {
    //
    // })
  });

  return (
    <div>
      <main>
        <h1>Hello, World!</h1>
      </main>
    </div>
  );
}
