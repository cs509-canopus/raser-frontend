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
    Flex, Modal, TextInput, NumberInput,
} from "@mantine/core";
import {
  HiOutlinePencilSquare,
  HiMiniListBullet,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { backend } from "@/axios-client";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types";
import { useRouter } from "next/navigation"

export default function RubricDesignerDashboard() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <RubricDesignerView />
    </Suspense>
  );
}

function RubricDesignerView() {
    const router = useRouter();
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // fields for create modal
    const [rubricName, setRubricName] = useState("");
    const [highQualityThreshold, setHighQualityThreshold] = useState<number | string>("");
    const [lowQualityThreshold, setLowQualityThreshold] = useState<number | string>("");

    // modal request state
    const [creatingRubric, setCreatingRubric] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchRubrics = async () => {
            try {
                const rubricResponse = await backend.get<Rubric[]>(
                    "/rubrics/by-designer",
                );
                console.log(
                    typeof rubricResponse.data,
                    rubricResponse.config.baseURL,
                    rubricResponse.request?.responseURL,
                );
                console.log(rubricResponse.data);
                if (!cancelled) {
                    setRubrics(rubricResponse.data);
                }

                const rubricList: Rubric[] = rubricResponse.data.map((rubric) => ({
                    ...rubric,
                }));
                setRubrics(rubricList);
            } catch (e) {
                console.log(`Error fetching rubrics`, e);
                if (!cancelled && e instanceof AxiosError && e.response) {
                    setError(e.response.data);
                }
            }
        };
        fetchRubrics();

        return () => {
            cancelled = true;
        }
    }, []);

    const handleCreateRubric = async () => {
        setCreatingRubric(false);

        if (!rubricName) {
            setCreateError("Please enter a title for the rubric.");
            return;
        }

        if (
            highQualityThreshold === "" ||
            lowQualityThreshold === "" ||
            Number(highQualityThreshold) < 0 ||
            Number(lowQualityThreshold) < 0
        ) {
            setCreateError("Please enter valid threshold values.");
            return;
        }

        if (Number(highQualityThreshold) <= Number(lowQualityThreshold)) {
            setCreateError("The high quality threshold must be greater than the low quality threshold.");
            return;
        }

        setCreatingRubric(true);

        try {
            const response = await backend.post("/rubrics", {
                name: rubricName,
                highQualityThreshold: Number(highQualityThreshold),
                lowQualityThreshold: Number(lowQualityThreshold),
            });

            const createRubric = response.data;

            router.push(`/rubrics/?id=${createRubric.rubricID}`);
        } catch (e) {
            console.error("Error creating rubric:", e);

            if (e instanceof AxiosError && e.response) {
                console.error("Response status:", e.response?.status);
                console.error("Response data:", e.response?.data);

                setCreateError(
                    e.response.data?.error ||
                    e.message ||
                    "Failed to create rubric."
                );
            } else if (e instanceof Error) {
                console.error("Error message:", e.message);
                setCreateError(e.message);
            } else {
                setCreateError("An unexpected error occurred.");
            }
        } finally {
            setCreatingRubric(false);
        }
    }

  return (
    <>
        <Modal
            opened = { createModalOpen }
            onClose = {() => {
                setCreateModalOpen(false);
                setCreateError(null);
            }}
            title = "Create a new rubric"
            centered
        >
            <Stack gap="md">
                <Text>
                    Enter the following information to create a new rubric.
                </Text>
                <TextInput
                    label="Rubric title"
                    placeholder="Enter rubric title"
                    required
                    value={rubricName}
                    onChange={(e) => setRubricName(e.currentTarget.value)}
                />
                <NumberInput
                    label="High Quality Threshold"
                    placeholder="Enter high quality threshold"
                    required
                    value={highQualityThreshold}
                    onChange={setHighQualityThreshold}
                />
                <NumberInput
                    label="Low Quality Threshold"
                    placeholder="Enter low quality threshold"
                    required
                    value={lowQualityThreshold}
                    onChange={setLowQualityThreshold}
                />

                {createError && (
                    <Text c="red" size="sm">
                        {createError}
                    </Text>
                )}

                <Flex justify="flex-end" gap="sm">
                    <Button
                        variant="default"
                        onClick={() => setCreateModalOpen(false)}
                        disabled={creatingRubric}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateRubric}
                        loading={creatingRubric}
                    >
                        Create
                    </Button>
                </Flex>
            </Stack>
        </Modal>
        <Container className={styles.page} fluid>
            <Flex direction="column" gap="xs">
                <Stack mb="sm" gap="xs">
                    <Title className={styles.title} order={1}>
                        Welcome back
                    </Title>
                    <Text className={styles.text}>
                        Design new review rubrics or browse the ones already published.
                    </Text>
                </Stack>
                <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                    <div>
                        <DesignRubricWidget
                            onCreateClick={() => setCreateModalOpen(true)}
                        />
                    </div>
                    <div>
                        <BrowseRubricsWidget />
                    </div>
                </SimpleGrid>
                <RubricList
                    rubrics={rubrics}
                    onView={(r) => console.log("view", r.rubricID)}
                    onDuplicate={(r) => console.log("duplicate", r.rubricID)}
                    onDeprecate={(r) => console.log("deprecate", r.rubricID)}
                    onEdit={(r) => console.log("edit", r.rubricID)}
                    onDelete={(r) => console.log("delete", r.rubricID)}
                />
            </Flex>
        </Container>
    </>
  );
}

interface DesignRubricWidgetProps {
    onCreateClick: () => void,
}

function DesignRubricWidget({ onCreateClick }: DesignRubricWidgetProps) {
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
        onClick={onCreateClick}
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
  rubricID: string;
  designerID: string;
  title: string;
  highQualityThreshold: number;
  lowQualityThreshold: number;
  publicationDate: string | null;
  isFavorite: boolean;
  replacedByID: string | null;
  createdAt: string | null;
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
      <tr key={rubric.rubricID}>
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
