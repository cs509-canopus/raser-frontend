"use client";

import styles from "./page.module.css";
import { Suspense, useState, useEffect } from "react";
import { backend } from "@/axios-client";
import { AxiosError } from "axios";
import { Journal, ErrorResponse } from "@/types"
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { Container, SimpleGrid, Flex, Stack, Title, Text, Button, Group, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function JournalEditorDashboard() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <JournalEditorView />
        </Suspense>
    );
}

function JournalEditorView() {
    const [journals, setJournals] = useState<Journal[]>([]);
    const [error, setError] = useState<ErrorResponse | null>(null);
    const [modalOpened, {open: openModal, close: closeModal}] =  useDisclosure(false);

    // // retrieve journals of user
    // useEffect(() => {
    //     let cancelled = false;
    //     const fetchJournals = async () => {
    //         try {
    //             const journalResponse = await backend.get<Journal[]>(
    //                 `/journals`,
    //             );
    //             console.log(typeof journalResponse.data, journalResponse.config.baseURL, journalResponse.request?.responseURL);
    //             console.log(journalResponse.data);
    //             if (!cancelled) {
    //                 setJournals(journalResponse.data);
    //             }
    //         } catch (e) {
    //             console.log(`Error fetching journals`, e);
    //             if (!cancelled && e instanceof AxiosError && e.response) {
    //                 setError(e.response.data);
    //             }
    //         }
    //     };

    //     fetchJournals();

    //     return () => {
    //         cancelled = true;
    //     };
    // }, []);

    // TODO: withdraw journal

    // add journal function for modal
    async function addJournal(name: string): Promise<string | undefined> {
        try {
            // journal add request
            const req = await backend.post<Journal>(`/journals`, { name });

            // add new journal to list
            setJournals((prev) => [...prev, req.data]);
        } catch (e) {
            if (e instanceof AxiosError && e.response) {
                return e.response.data.error;
            } else {
                console.log(`Unknown error POST /journals`, e);
            }
        }
        return undefined;
    }

    return (
        <Container className={styles.page} fluid>
            <Flex direction="column" gap="xs" w="100%">
                <Group justify="space-between">
                    <Stack mb="sm" spacing="xs">
                        <Title className={styles.title} order={1}>
                            Your Journals
                        </Title>
                        <Text className={styles.text}>
                            Add the journals you edit, open one to manage its issues and papers, or withdraw a journal's registration.
                        </Text>
                    </Stack>
                    <Button
                        className={styles.button}
                        radius="md"
                        color="#25262b"
                        onClick={openModal}
                    >
                        Add journal
                    </Button>
                </Group>
                {error && (
                    <Text c="red" size="sm">
                        {error.error}
                    </Text>
                )}
                <SimpleGrid cols={2} spacing="xs">
                    <div>
                        <JournalCardList 
                            journals={journals}
                            onSelect={(j) => console.log("select", j.journalID)}
                            onWithdraw={(j) => console.log("withdraw", j.journalID)}
                        />
                    </div>
                    <div>
                        <Container className={styles.container} fluid>
                            <Title order={5}>
                                Reviewer rubrics
                            </Title>
                        </Container>
                    </div>
                </SimpleGrid>
            </Flex>

            <AddJournalModal 
                opened={modalOpened}
                onClose={closeModal}
                onSubmit={addJournal}
            />
        </Container>
    );
}

// listing journals components
interface JournalListProps {
    journals: Journal[];
    onSelect?: (journal: Journal) => void;
    onWithdraw?: (journal: Journal) => void;
}

function JournalCardList({
    journals, 
    onSelect, 
    onWithdraw
}: JournalListProps) {
    if (journals.length === 0 ){
        return (
            <Container className={styles.container} fluid>
                <Text className={styles.text}>
                    You haven't added any journals yet. Click the "Add journal" button to get started.
                </Text>
            </Container>
        );
    }
    return (
        <Stack gap="xs">
            <SimpleGrid cols={2} spacing="xs">
                {journals.map((journal) => (
                    <JournalCard 
                        key={journal.journalID}
                        journal={journal}
                        onSelect={onSelect}
                        onWithdraw={onWithdraw}
                    />
                ))}
            </SimpleGrid>
            <Flex align="center" gap="xs">
                <HiOutlineInformationCircle size={14} color="#868e96"/>
                <Text className={styles.text}>
                    A journal can't be withdrawn once any of its papers has a reviewer assigned.
                </Text>
            </Flex>
        </Stack>
    );
}

interface JournalCardProps {
    journal: Journal;
    onSelect?: (journal: Journal) => void;
    onWithdraw?: (journal: Journal) => void;
}

function JournalCard({
    journal, 
    onSelect, 
    onWithdraw
}: JournalCardProps) {
    const issueCount = journal.issues.length;
    // TODO: only allow withdraws for journals with papers that have no reviewers assigned -> iteration 2
    const canWithdraw = true;

    return (
        <Container className={styles.container} fluid>
            <div>
                {journal.coverImage ? (
                    <img src={journal.coverImage} alt={`${journal.name} logo`} />
                ) : (
                    <span>
                        {journal.name.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
            <Title className={styles.title} order={2}>
                {journal.name}
            </Title>
            <Text className={styles.text}>
                {issueCount} {issueCount === 1 ? "issue" : "issues"}
            </Text>
            <Stack gap="xs">
                <Button 
                    className={styles.button} 
                    fullWidth
                    onClick={() => onSelect?.(journal)}
                >
                    Select
                </Button>
                <Button 
                    className={styles.withdrawButton} 
                    fullWidth
                    onClick={() => onWithdraw?.(journal)}
                >
                    Withdraw
                </Button>
            </Stack>
        </Container>
    );
}

// Add journal modal components
interface AddJournalModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
}

function AddJournalModal({
    opened,
    onClose,
    onSubmit
}: AddJournalModalProps) {
    const [name, setName] = useState("");

    const handleClose = () => {
        setName("");
        onClose();
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setName("");
    };

    return (
        <Modal opened={opened} onClose={handleClose} title="Add journal" radius="md" centered>
            <Stack gap="md">
                <Text className={styles.text}>
                    Add a journal you edit to your dashboard. Then open it to create issues and add papers.
                </Text>
                <TextInput
                    label="Journal name"
                    description="The journal's full name, as authors and reviewers know it"
                    placeholder="e.g. ACM Transactions on Computer Systems"
                    withAsterisk
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)} 
                />
                <Group justify="flex-end" gap="xs">
                    <Button 
                        className={styles.buttonAlt}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        className={styles.button}
                        color="#25262b"
                        disabled={!name.trim()}
                    >
                        Add journal
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}