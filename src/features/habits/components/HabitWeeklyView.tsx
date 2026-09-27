import { Box, Grid, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { Archive, Check, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getHabitStreak,
  isHabitScheduledOnDate,
} from "@/features/habits/services/habit-calendar.service";
import type { Habit, HabitLog } from "@/features/habits/types/habits.types";

type HabitWeeklyViewProps = {
  dates: string[];
  isArchived: boolean;
  isUpdating: boolean;
  habits: Habit[];
  logs: HabitLog[];
  onArchive: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
};

function formatDay(date: string, locale: string) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(year, month - 1, day, 12);
  return {
    day: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(value),
    number: value.getDate(),
  };
}

export function HabitWeeklyView({
  dates,
  habits,
  isArchived,
  isUpdating,
  logs,
  onArchive,
  onEdit,
}: HabitWeeklyViewProps) {
  const { i18n, t } = useTranslation();
  const columns = "minmax(10rem, 1.6fr) repeat(7, minmax(3.25rem, 1fr))";

  return (
    <Box overflowX="auto">
      <Grid minW="38rem" templateColumns={columns}>
        <Text color="fg.muted" fontSize="xs" fontWeight="semibold" pb="3">
          {t("habits.habitColumn")}
        </Text>
        {dates.map((date) => {
          const formatted = formatDay(date, i18n.language);
          return (
            <Stack align="center" gap="0" key={date} pb="3">
              <Text color="fg.muted" fontSize="xs">
                {formatted.day}
              </Text>
              <Text fontSize="sm" fontWeight="semibold">
                {formatted.number}
              </Text>
            </Stack>
          );
        })}
        {habits.map((habit) => {
          const streak = getHabitStreak(habit, logs);
          const weeklyCount = logs
            .filter(
              (log) =>
                log.habitId === habit.id &&
                dates[0] <= log.date &&
                log.date <= dates[6],
            )
            .reduce((total, log) => total + log.progress, 0);
          return (
            <Grid
              borderTopWidth="1px"
              gridColumn="1 / -1"
              key={habit.id}
              minW="38rem"
              templateColumns={columns}
            >
              <HStack justify="space-between" minH="3.75rem" pr="2">
                <Stack gap="0" minW="0">
                  <Text fontSize="sm" fontWeight="medium">
                    {habit.name}
                  </Text>
                  <HStack gap="2">
                    <Text color="fg.muted" fontSize="xs">
                      {habit.schedule.type === "weekly-target"
                        ? t("habits.weekProgress", {
                            current: weeklyCount,
                            target: habit.targetCount,
                          })
                        : t("habits.streakDays", { count: streak })}
                    </Text>
                    {habit.schedule.type === "weekly-target" ? (
                      <Text color="fg.muted" fontSize="xs">
                        {t("habits.streakWeeks", { count: streak })}
                      </Text>
                    ) : null}
                  </HStack>
                </Stack>
                {!isArchived ? (
                  <HStack flexShrink="0" gap="0">
                    <IconButton
                      aria-label={t("habits.editHabit", { habit: habit.name })}
                      disabled={isUpdating}
                      onClick={() => onEdit(habit)}
                      size="xs"
                      title={t("habits.editHabit", { habit: habit.name })}
                      variant="ghost"
                    >
                      <Pencil aria-hidden="true" size={14} />
                    </IconButton>
                    <IconButton
                      aria-label={t("habits.archiveHabit", {
                        habit: habit.name,
                      })}
                      disabled={isUpdating}
                      onClick={() => onArchive(habit)}
                      size="xs"
                      title={t("habits.archiveHabit", { habit: habit.name })}
                      variant="ghost"
                    >
                      <Archive aria-hidden="true" size={14} />
                    </IconButton>
                  </HStack>
                ) : null}
              </HStack>
              {dates.map((date) => {
                const scheduled =
                  habit.schedule.type !== "weekly-target" &&
                  isHabitScheduledOnDate(habit, date);
                const log = logs.find(
                  (item) => item.habitId === habit.id && item.date === date,
                );
                const completed = Boolean(log?.completed);
                const ariaLabel =
                  habit.schedule.type === "weekly-target"
                    ? log
                      ? t("habits.dayProgress", {
                          habit: habit.name,
                          date,
                          progress: log.progress,
                        })
                      : t("habits.dayFlexible", { habit: habit.name, date })
                    : scheduled
                      ? completed
                        ? t("habits.dayComplete", { habit: habit.name, date })
                        : t("habits.dayPending", { habit: habit.name, date })
                      : t("habits.dayUnscheduled", { habit: habit.name, date });
                return (
                  <Box
                    alignItems="center"
                    aria-label={ariaLabel}
                    bg={
                      scheduled || habit.schedule.type === "weekly-target"
                        ? "transparent"
                        : "bg.subtle"
                    }
                    borderLeftWidth="1px"
                    display="flex"
                    justifyContent="center"
                    key={date}
                    minH="3.75rem"
                    role="img"
                  >
                    {!scheduled && habit.schedule.type !== "weekly-target" ? (
                      <Text color="fg.muted" fontSize="xs" aria-hidden="true">
                        -
                      </Text>
                    ) : completed ? (
                      <Check
                        aria-hidden="true"
                        color="success.fg"
                        size={17}
                      />
                    ) : log?.progress ? (
                      <Text color="fg.muted" fontSize="xs">
                        {log.progress}
                      </Text>
                    ) : (
                      <Box
                        aria-hidden="true"
                        borderColor="border"
                        borderRadius="full"
                        borderWidth="1px"
                        boxSize="2"
                      />
                    )}
                  </Box>
                );
              })}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
