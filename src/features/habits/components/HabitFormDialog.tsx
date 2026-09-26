import {
  Box,
  Button,
  Checkbox,
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
import { createHabitInputSchema } from "@/features/habits/schemas/habits.schemas";
import type {
  CreateHabitInput,
  Habit,
  HabitWeekday,
} from "@/features/habits/types/habits.types";

type HabitFormDialogProps = {
  habit?: Habit;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateHabitInput) => void;
  open: boolean;
};

const weekdays: HabitWeekday[] = [1, 2, 3, 4, 5, 6, 7];

function localWeekdayLabel(weekday: HabitWeekday, locale: string) {
  const date = new Date(2026, 0, 4 + weekday, 12);
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
}

export function HabitFormDialog({
  habit,
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
}: HabitFormDialogProps) {
  const { i18n, t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<
    "daily" | "weekdays" | "weekly-target"
  >("daily");
  const [selectedWeekdays, setSelectedWeekdays] = useState<HabitWeekday[]>([]);
  const [targetCount, setTargetCount] = useState("");
  const [unit, setUnit] = useState("");
  const [formError, setFormError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? "");
    setDescription(habit?.description ?? "");
    setFrequency(habit?.schedule.type ?? "daily");
    setSelectedWeekdays(
      habit?.schedule.type === "weekdays" ? habit.schedule.weekdays : [],
    );
    setTargetCount(habit?.targetCount ? String(habit.targetCount) : "");
    setUnit(habit?.unit ?? "");
    setFormError(false);
  }, [habit, open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = {
      description: description.trim() || undefined,
      name,
      schedule:
        frequency === "weekdays"
          ? { type: "weekdays" as const, weekdays: selectedWeekdays }
          : { type: frequency },
      targetCount: targetCount ? Number(targetCount) : undefined,
      unit: unit.trim() || undefined,
    };
    const result = createHabitInputSchema.safeParse(input);
    if (!result.success) {
      setFormError(true);
      return;
    }
    setFormError(false);
    onSubmit(result.data);
  }

  function toggleWeekday(weekday: HabitWeekday, checked: boolean) {
    setSelectedWeekdays((current) =>
      checked
        ? [...current, weekday].sort((left, right) => left - right)
        : current.filter((value) => value !== weekday),
    );
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
                  {habit ? t("habits.editTitle") : t("habits.createTitle")}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton aria-label={t("common.close")} size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label>{t("habits.name")}</Field.Label>
                    <Input
                      autoFocus
                      maxLength={100}
                      onChange={(event) => setName(event.target.value)}
                      value={name}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("habits.descriptionLabel")}</Field.Label>
                    <Textarea
                      maxLength={2_000}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={2}
                      value={description}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("habits.schedule")}</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        onChange={(event) =>
                          setFrequency(event.target.value as typeof frequency)
                        }
                        value={frequency}
                      >
                        <option value="daily">{t("habits.daily")}</option>
                        <option value="weekdays">
                          {t("habits.specificDays")}
                        </option>
                        <option value="weekly-target">
                          {t("habits.weeklyTarget")}
                        </option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                  {frequency === "weekdays" ? (
                    <Box as="fieldset">
                      <Text
                        as="legend"
                        fontSize="sm"
                        fontWeight="medium"
                        mb="2"
                      >
                        {t("habits.daysOfWeek")}
                      </Text>
                      <Stack direction="row" gap="3" wrap="wrap">
                        {weekdays.map((weekday) => (
                          <Checkbox.Root
                            checked={selectedWeekdays.includes(weekday)}
                            key={weekday}
                            onCheckedChange={(details) =>
                              toggleWeekday(weekday, Boolean(details.checked))
                            }
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>
                              {localWeekdayLabel(weekday, i18n.language)}
                            </Checkbox.Label>
                          </Checkbox.Root>
                        ))}
                      </Stack>
                    </Box>
                  ) : null}
                  <Stack direction={{ base: "column", sm: "row" }} gap="3">
                    <Field.Root required={frequency === "weekly-target"}>
                      <Field.Label>{t("habits.targetCount")}</Field.Label>
                      <Input
                        min={1}
                        onChange={(event) => setTargetCount(event.target.value)}
                        type="number"
                        value={targetCount}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>{t("habits.unit")}</Field.Label>
                      <Input
                        maxLength={40}
                        onChange={(event) => setUnit(event.target.value)}
                        placeholder={t("habits.unitPlaceholder")}
                        value={unit}
                      />
                    </Field.Root>
                  </Stack>
                  {formError ? (
                    <Text color="fg.error" fontSize="sm" role="alert">
                      {t("habits.formError")}
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
                  {habit ? t("habits.saveChanges") : t("habits.createTitle")}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
