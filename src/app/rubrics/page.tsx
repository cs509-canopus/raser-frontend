"use client";

import styles from "./page.module.css";
import { Suspense } from "react";
import { SimpleGrid, Container, Button, Text } from "@mantine/core";

export default function EditRubricPage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <EditRubricView />
        </Suspense>
    );
}

function EditRubricView() {
    return (
        <div className={styles.page}>
            <h1>Edit Rubric</h1>
            <p>Here you can edit an existing rubric.</p>
        </div>
    );
}
