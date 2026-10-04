import {
  Box,
  Checkbox,
  Flex,
  HStack,
  IconButton,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Archive, Check, Minus, Pencil, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import type { Habit, HabitLog } from "@/features/habits/types/habits.types";

type HabitTodayListProps = {
  date: string;
  habits: Habit[];
  isArchived: boolean;
  isUpdating: boolean;
  logs: HabitLog[];
  onArchive: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onWriteProgress: (habit: Habit, date: string, progress: number) => void;
};

function getCurrentWeekProgress(habit: Habit, logs: HabitLog[], date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(year, month - 1, day, 12).getDay();
  const start = new Date(year, month - 1, day - ((weekday + 6) % 7), 12);
  const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 6,
    12,
  );
  const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
  return logs
    .filter(
      (log) =>
        log.habitId === habit.id &&
        log.date >= startDate &&
        log.date <= endDate,
    )
    .reduce((total, log) => total + log.progress, 0);
}

export function HabitTodayList({
  date,
  habits,
  isArchived,
  isUpdating,
  logs,
  onArchive,
  onEdit,
  onWriteProgress,
}: HabitTodayListProps) {
  const { t } = useTranslation();

  if (habits.length === 0) {
    return (
      <EmptyState
        description={t(
          isArchived
            ? "habits.archivedEmptyDescription"
            : "habits.todayEmptyDescription",
        )}
        title={t(
          isArchived ? "habits.archivedEmptyTitle" : "habits.todayEmptyTitle",
        )}
      />
    );
  }

  return (
    <Stack gap="3">
      {habits.map((habit) => {
        const todayLog = logs.find(
          (log) => log.habitId === habit.id && log.date === date,
        );
        const currentDayProgress = todayLog?.progress ?? 0;
        const currentProgress =
          habit.schedule.type === "weekly-target"
            ? getCurrentWeekProgress(habit, logs, date)
            : currentDayProgress;
        const targetCount = habit.targetCount ?? 1;
        const isComplete =
          habit.schedule.type === "weekly-target"
            ? currentProgress >= targetCount
            : Boolean(todayLog?.completed);
        const hasTarget = habit.targetCount !== undefined;

        return (
          <Flex
            align={{ base: "flex-start", sm: "center" }}
            bg="bg.elevated"
            borderColor={isComplete ? "success.fg" : "border.subtle"}
            borderWidth="1px"
            gap="3"
            key={habit.id}
            p={{ base: "3", md: "4" }}
            rounded="l2"
            shadow="xs"
          >
            <Box flex="1" minW="0">
              {hasTarget ? (
                <Stack gap="1">
                  <Flex align="center" gap="2" justify="space-between">
                    <Text fontWeight="medium">{habit.name}</Text>
                    <Text color="fg.muted" fontSize="sm" whiteSpace="nowrap">
                      {t("habits.progress", {
                        current: currentProgress,
                        target: habit.targetCount,
                        unit: habit.unit ? ` ${habit.unit}` : "",
                      })}
                    </Text>
                  </Flex>
                  <Progress.Root
                    max={habit.targetCount ?? 1}
                    size="xs"
                    value={Math.min(currentProgress, habit.targetCount ?? 1)}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                  {habit.description ? (
                    <Text color="fg.muted" fontSize="sm">
                      {habit.description}
                    </Text>
                  ) : null}
                </Stack>
              ) : (
                <Checkbox.Root
                  checked={isComplete}
                  disabled={isArchived || isUpdating}
                  onCheckedChange={(details) =>
                    onWriteProgress(habit, date, details.checked ? 1 : 0)
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>{habit.name}</Checkbox.Label>
                </Checkbox.Root>
              )}
            </Box>
            {hasTarget ? (
              <HStack gap="1">
                {!isComplete ? (
                  <IconButton
                    aria-label={t("habits.completeTarget", {
                      habit: habit.name,
                    })}
                    disabled={isArchived || isUpdating}
                    onClick={() => {
                      const remaining = Math.max(
                        0,
                        (habit.targetCount ?? 0) - currentProgress,
                      );
                      onWriteProgress(
                        habit,
                        date,
                        currentDayProgress + remaining,
                      );
                    }}
                    size="sm"
                    title={t("habits.completeTarget", { habit: habit.name })}
                    variant="ghost"
                  >
                    <Check aria-hidden="true" size={17} />
                  </IconButton>
                ) : null}
                <IconButton
                  aria-label={t("habits.decreaseProgress", {
                    habit: habit.name,
                  })}
                  disabled={
                    isArchived || isUpdating || currentDayProgress === 0
                  }
                  onClick={() =>
                    onWriteProgress(
                      habit,
                      date,
                      Math.max(0, currentDayProgress - 1),
                    )
                  }
                  size="sm"
                  variant="ghost"
                >
                  <Minus aria-hidden="true" size={16} />
                </IconButton>
                <IconButton
                  aria-label={t("habits.increaseProgress", {
                    habit: habit.name,
                  })}
                  disabled={
                    isArchived ||
                    isUpdating ||
                    (habit.schedule.type === "weekly-target"
                      ? currentProgress >= targetCount
                      : currentDayProgress >= targetCount)
                  }
                  onClick={() => {
                    const nextDayProgress = currentDayProgress + 1;
                    onWriteProgress(habit, date, nextDayProgress);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <Plus aria-hidden="true" size={16} />
                </IconButton>
              </HStack>
            ) : null}
            {!isArchived ? (
              <HStack gap="1">
                <IconButton
                  aria-label={t("habits.editHabit", { habit: habit.name })}
                  onClick={() => onEdit(habit)}
                  size="sm"
                  title={t("habits.editHabit", { habit: habit.name })}
                  variant="ghost"
                >
                  <Pencil aria-hidden="true" size={15} />
                </IconButton>
                <IconButton
                  aria-label={t("habits.archiveHabit", { habit: habit.name })}
                  onClick={() => onArchive(habit)}
                  size="sm"
                  title={t("habits.archiveHabit", { habit: habit.name })}
                  variant="ghost"
                >
                  <Archive aria-hidden="true" size={15} />
                </IconButton>
              </HStack>
            ) : null}
          </Flex>
        );
      })}
    </Stack>
  );
}
