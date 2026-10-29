"use client"

import styles from "./page.module.css"

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function JournalsPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <JournalView />
    </Suspense>
  );
}

function JournalView() {
  const searchParams = useSearchParams();
  const journalID = searchParams.get('id'); // string | null

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>This is journal {journalID}</h1>
      </main>
    </div>
  )
}


