import { Modal, Stack, Text, TextInput, Button } from "@mantine/core";
import { useState } from "react";

interface ConfirmationModalProps {
  /** Whether the modal should be shown */
  opened: boolean;

  /** Called when the modal is closed */
  closeModal: () => void;

  /** Function to execute on confirmation. If it returns a promise, the modal
   * waits for it to settle before allowing another confirmation. */
  action: () => void | Promise<void>;

  /** Informational text about the consequences of taking this action */
  infoText?: string;

  /**
   * If provided, the user must enter this text exactly in order to confirm the action.
   */
  confirmationText?: string;

  /** Extra content shown above the confirmation input */
  children?: React.ReactNode;

  /** Additional condition that must be true for the action to be confirmed */
  canConfirm?: boolean;
}

/**
 * Modal that confirms an action. The modal displays `infoText` to inform the
 * user of the consequences of the action (if provided). It shows a "Confirm"
 * button which calls `action` on click. If `confirmationText` is provided, the
 * button can only be clicked after entering the `confirmationText` into a text
 * input.
 */
export function ConfirmationModal({
  opened,
  closeModal,
  action,
  infoText,
  confirmationText,
  children,
  canConfirm = true,
}: ConfirmationModalProps) {
  const [actionIsInProgress, setActionIsInProgress] = useState(false);
  const [inputText, setInputText] = useState("");

  const canClickDelete =
    canConfirm &&
    !actionIsInProgress &&
    (confirmationText === undefined || inputText === confirmationText);

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      title="Confirm action"
      size="lg"
    >
      <Stack>
        {infoText && <Text fw="bold">{infoText}</Text>}
        {children}
        {confirmationText && (
          <TextInput
            label={`Enter "${confirmationText}" below to proceed`}
            value={inputText}
            onChange={(event) => setInputText(event.currentTarget.value)}
            withAsterisk
            placeholder={confirmationText}
          />
        )}
        <Button
          variant="filled"
          color="red"
          onClick={async () => {
            setActionIsInProgress(true);
            try {
              await action();
            } finally {
              setActionIsInProgress(false);
            }
          }}
          disabled={!canClickDelete}
        >
          {actionIsInProgress ? "In progress..." : "Confirm"}
        </Button>
      </Stack>
    </Modal>
  );
}
