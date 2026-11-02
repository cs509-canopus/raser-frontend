"use client";
import styles from "./page.module.css";
import RubricDesignerDashboard from "./RubricDesignerDashboard";
import JournalEditorDashboard from "./JournalEditorDashboard";
import RootLayout from "./layout";
import { useState } from "react";
import { Button, Flex } from "@mantine/core";

export default function Home() {
  const [isRubricEditor, setIsRubricEditor] = useState(true);

  return (
    <div className={styles.page}>
      <Flex direction="row" gap="xs" justify="center">
        <Button
          className={styles.button}
          onClick={() => setIsRubricEditor(false)}
        >
          Show journal editor dashboard
        </Button>
        <Button
          className={styles.button}
          onClick={() => setIsRubricEditor(true)}
        >
          Show rubric designer dashboard
        </Button>
      </Flex>
      {isRubricEditor ? (
        <RubricDesignerDashboard />
      ) : (
        <JournalEditorDashboard />
      )}
    </div>
  );
}
