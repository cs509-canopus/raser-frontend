"use client";

import styles from "./page.module.css";
import { Suspense, useState, useEffect } from "react";
import {
  SimpleGrid,
  Container,
  Button,
  Text,
  Stack,
  Title,
  Table,
  Flex,
} from "@mantine/core";
import {
  HiOutlinePencilSquare,
  HiMiniListBullet,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { backend } from "@/axios-client";
import { AxiosError } from "axios";

export default function RubricDesignerDashboard() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <RubricDesignerView />
    </Suspense>
  );
}

function RubricDesignerView() {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  // TODO: implement /rubrics/by-designer/{userID} next iteration

  return (
    <Container className={styles.page} fluid>
      <Flex direction="column" gap="xs">
        <Stack mb="sm" spacing="xs">
          <Title className={styles.title} order={1}>
            Welcome back
          </Title>
          <Text className={styles.text}>
            Design new review rubrics or browse the ones already published.
          </Text>
        </Stack>
        <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
          <div>
            <DesignRubricWidget />
          </div>
          <div>
            <BrowseRubricsWidget />
          </div>
        </SimpleGrid>
        <RubricList
          rubrics={rubrics}
          onView={(r) => console.log("view", r.id)}
          onDuplicate={(r) => console.log("duplicate", r.id)}
          onDeprecate={(r) => console.log("deprecate", r.id)}
          onEdit={(r) => console.log("edit", r.id)}
          onDelete={(r) => console.log("delete", r.id)}
        />
      </Flex>
    </Container>
  );
}

function DesignRubricWidget() {
  return (
    <Container className={styles.container}>
      <HiOutlinePencilSquare size={48} color="#25262b" />
      <Title className={styles.title} order={2}>
        Design a new rubric
      </Title>
      <Text className={styles.text}>
        Here you can create a new rubric for assessing scientific experimental
        research.
      </Text>
      <Button
        className={styles.button}
        onClick={() => {
          // Navigate to the rubric creation page
          // TODO: edit this so that it shows individual rubrics to be edited
          window.location.href = "/rubrics";
        }}
      >
        <Text>Create rubric</Text>
      </Button>
    </Container>
  );
}

function BrowseRubricsWidget() {
  return (
    <Container className={styles.container}>
      <HiMiniListBullet size={48} color="#25262b" />
      <Title className={styles.title} order={2}>
        Browse rubrics
      </Title>
      <Text className={styles.text}>
        See every published rubric. Open one read-only, or duplicate it to use
        as the starting point for a new rubric.
      </Text>
      <Button
        className={styles.button}
        // onClick={() => {
        //     // Navigate to the rubric browsing page

        // }}
      >
        <Text>View all rubrics</Text>
      </Button>
    </Container>
  );
}

// components to create current user's rubric list w/ sort and searching functionality
export interface Rubric {
  id: string;
  designerID: string;
  title: string;
  highScoreThreshold: number;
  lowScoreThreshold: number;
  publicationDate: string | null;
  isFavorite: boolean;
  replacedByID: string | null;
  deprecationDate?: string | null;
}

interface RubricListProps {
  rubrics: Rubric[];
  onView?: (rubric: Rubric) => void;
  onDuplicate?: (rubric: Rubric) => void;
  onDeprecate?: (rubric: Rubric) => void;
  onEdit?: (rubric: Rubric) => void;
  onDelete?: (rubric: Rubric) => void;
}

type RubricStatus = "DRAFT" | "PUBLISHED" | "DEPRECATED";

function getRubricStatus(rubric: Rubric): RubricStatus {
  if (!rubric.publicationDate) {
    return "DRAFT";
  }
  if (rubric.replacedByID || rubric.deprecationDate) {
    return "DEPRECATED";
  }
  return "PUBLISHED";
}

function formateDate(date: string | null | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RubricList({
  rubrics,
  onView,
  onDuplicate,
  onDeprecate,
  onEdit,
  onDelete,
}: RubricListProps) {
  const rows = rubrics.map((rubric) => {
    const status = getRubricStatus(rubric);
    return (
      <tr key={rubric.id}>
        <td>{rubric.title}</td>
        <td>{status}</td>
        <td>{formateDate(rubric.publicationDate)}</td>
        <td>{formateDate(rubric.deprecationDate)}</td>
        <td>
          {status === "DRAFT" ? (
            <>
              <Button onClick={() => onEdit?.(rubric)}>Edit</Button>
              <Button onClick={() => onDelete?.(rubric)}>Delete</Button>
            </>
          ) : (
            <>
              <Button onClick={() => onView?.(rubric)}>View</Button>
              <Button onClick={() => onDuplicate?.(rubric)}>Duplicate</Button>
              {status === "PUBLISHED" && (
                <Button onClick={() => onDeprecate?.(rubric)}>Deprecate</Button>
              )}
            </>
          )}
        </td>
      </tr>
    );
  });
  return (
    <Container className={styles.rubricList} fluid>
      <Title className={styles.title} order={2}>
        My rubrics
      </Title>
      <Table>
        <thead>
          <tr>
            <th>RUBRIC</th>
            <th>PUBLISHED</th>
            <th>DEPRECATED</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td>You don't have any rubrics yet</td>
            </tr>
          )}
        </tbody>
      </Table>
      <Flex align="center" gap="xs">
        <HiOutlineInformationCircle size={14} color="#868e96" />
        <Text className={styles.text}>
          Only drafts can be edited or deleted. Once published, a rubric can be
          viewed, duplicated, or deprecated.
        </Text>
      </Flex>
    </Container>
  );
}
