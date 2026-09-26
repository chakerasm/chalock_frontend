import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { goalFormSchema } from "@/features/goals/schemas/goals.schemas";
import type { CreateGoalInput, Goal } from "@/features/goals/types/goals.types";

type GoalFormDialogProps = {
  goal?: Goal;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateGoalInput) => void;
  open: boolean;
};

export function GoalFormDialog({
  goal,
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
}: GoalFormDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [progressMode, setProgressMode] = useState<"manual" | "task-based">(
    "manual",
  );
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? "");
    setDescription(goal?.description ?? "");
    setTargetDate(goal?.targetDate ?? "");
    setProgressMode(goal?.progressStrategy.mode ?? "manual");
    setProgress(goal?.progress ?? 0);
    setHasError(false);
  }, [goal, open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = goalFormSchema.safeParse({
      description,
      progress: progressMode === "manual" ? progress : 0,
      progressMode,
      targetDate,
      title,
    });
    if (!result.success) {
      setHasError(true);
      return;
    }
    setHasError(false);
    onSubmit({
      description: result.data.description.trim() || undefined,
      progress: result.data.progress,
      progressStrategy: { mode: result.data.progressMode },
      targetDate: result.data.targetDate || undefined,
      title: result.data.title.trim(),
    });
  }

  return (
    <Dialog.Root
      onOpenChange={(details) => onOpenChange(details.open)}
      open={open}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p="4">
          <Dialog.Content>
            <form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>
                  {goal ? t("goals.editTitle") : t("goals.createTitle")}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton aria-label={t("common.close")} size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label>{t("goals.titleLabel")}</Field.Label>
                    <Input
                      autoFocus
                      maxLength={120}
                      onChange={(event) => setTitle(event.target.value)}
                      value={title}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("goals.descriptionLabel")}</Field.Label>
                    <Textarea
                      maxLength={2_000}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={3}
                      value={description}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("goals.targetDate")}</Field.Label>
                    <Input
                      onChange={(event) => setTargetDate(event.target.value)}
                      type="date"
                      value={targetDate}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("goals.progressMode")}</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        onChange={(event) =>
                          setProgressMode(
                            event.target.value as typeof progressMode,
                          )
                        }
                        value={progressMode}
                      >
                        <option value="manual">
                          {t("goals.modes.manual")}
                        </option>
                        <option value="task-based">
                          {t("goals.modes.taskBased")}
                        </option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                  {progressMode === "manual" ? (
                    <Field.Root>
                      <Field.Label>{t("goals.progressPercent")}</Field.Label>
                      <Input
                        max={100}
                        min={0}
                        onChange={(event) =>
                          setProgress(Number(event.target.value))
                        }
                        type="number"
                        value={progress}
                      />
                    </Field.Root>
                  ) : (
                    <Text color="fg.muted" fontSize="sm">
                      {t("goals.taskBasedDescription")}
                    </Text>
                  )}
                  {hasError ? (
                    <Text color="fg.error" fontSize="sm" role="alert">
                      {t("goals.formError")}
                    </Text>
                  ) : null}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() => onOpenChange(false)}
                  type="button"
                  variant="ghost"
                >
                  {t("form.cancel")}
                </Button>
                <Button
                  colorPalette="brand"
                  loading={isSubmitting}
                  type="submit"
                >
                  {goal ? t("goals.saveChanges") : t("goals.createTitle")}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
