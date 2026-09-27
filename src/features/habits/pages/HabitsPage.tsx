import { Box, Button, Container, HStack, Stack, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingState } from "@/components/shared/LoadingState/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { toast } from "@/components/ui/Toaster/Toaster";
import { HabitFormDialog } from "@/features/habits/components/HabitFormDialog";
import { HabitTodayList } from "@/features/habits/components/HabitTodayList";
import { HabitWeeklyView } from "@/features/habits/components/HabitWeeklyView";
import {
  useArchiveHabit,
  useCreateHabit,
  useHabitLogs,
  useHabits,
  useUpdateHabit,
  useWriteHabitLog,
} from "@/features/habits/hooks/use-habits";
import {
  addLocalDays,
  getLocalDate,
  getWeekStart,
  isHabitScheduledOnDate,
} from "@/features/habits/services/habit-calendar.service";
import type {
  CreateHabitInput,
  Habit,
  HabitState,
} from "@/features/habits/types/habits.types";

type HabitView = "today" | "week";

function formatWeek(start: string, end: string, locale: string) {
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay, 12);
  const endDate = new Date(endYear, endMonth - 1, endDay, 12);
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  });
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

export function HabitsPage() {
  const { i18n, t } = useTranslation();
  const today = getLocalDate();
  const weekStart = getWeekStart(today);
  const weekDates = Array.from({ length: 7 }, (_, index) =>
    addLocalDays(weekStart, index),
  );
  const [view, setView] = useState<HabitView>("today");
  const [listState, setListState] = useState<HabitState>("active");
  const [editingHabit, setEditingHabit] = useState<Habit>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const habitsQuery = useHabits({ state: listState });
  const historyStart = (habitsQuery.data ?? []).reduce((earliest, habit) => {
    const createdDate = getLocalDate(new Date(habit.createdAt));
    return createdDate < earliest ? createdDate : earliest;
  }, weekStart);
  const logsQuery = useHabitLogs(historyStart, weekDates[6]);
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const archiveMutation = useArchiveHabit();
  const writeLogMutation = useWriteHabitLog();

  if (habitsQuery.isPending || logsQuery.isPending) return <LoadingState />;
  if (habitsQuery.isError || logsQuery.isError) {
    return (
      <Container maxW="6xl" py={{ base: "8", md: "12" }}>
        <ErrorState
          onRetry={() => {
            void habitsQuery.refetch();
            void logsQuery.refetch();
          }}
        />
      </Container>
    );
  }

  const habits = habitsQuery.data ?? [];
  const logs = logsQuery.data ?? [];
  const todayHabits = habits.filter((habit) => {
    if (!isHabitScheduledOnDate(habit, today)) return false;
    if (habit.schedule.type !== "weekly-target") return true;
    const progress = logs
      .filter(
        (log) =>
          log.habitId === habit.id &&
          log.date >= weekStart &&
          log.date <= weekDates[6],
      )
      .reduce((total, log) => total + log.progress, 0);
    return progress < (habit.targetCount ?? 0);
  });
  const isUpdating =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending ||
    writeLogMutation.isPending;

  function openCreate() {
    setEditingHabit(undefined);
    setIsFormOpen(true);
  }

  function saveHabit(input: CreateHabitInput) {
    if (editingHabit) {
      updateMutation.mutate(
        { ...input, habitId: editingHabit.id },
        {
          onError: () => toast.error({ title: t("habits.updateError") }),
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingHabit(undefined);
            toast.success({ title: t("habits.updated") });
          },
        },
      );
      return;
    }
    createMutation.mutate(input, {
      onError: () => toast.error({ title: t("habits.createError") }),
      onSuccess: () => {
        setIsFormOpen(false);
        toast.success({ title: t("habits.created") });
      },
    });
  }

  function archive(habit: Habit) {
    archiveMutation.mutate(habit.id, {
      onError: () => toast.error({ title: t("habits.archiveError") }),
      onSuccess: () => toast.success({ title: t("habits.archived") }),
    });
  }

  function writeProgress(habit: Habit, date: string, progress: number) {
    writeLogMutation.mutate(
      {
        date,
        habitId: habit.id,
        log: {
          progress,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
      { onError: () => toast.error({ title: t("habits.progressError") }) },
    );
  }

  const completedToday = todayHabits.filter((habit) => {
    const dayLog = logs.find(
      (log) => log.habitId === habit.id && log.date === today,
    );
    if (habit.schedule.type === "weekly-target") {
      return (
        logs
          .filter(
            (log) =>
              log.habitId === habit.id &&
              log.date >= weekStart &&
              log.date <= weekDates[6],
          )
          .reduce((total, log) => total + log.progress, 0) >=
        (habit.targetCount ?? 0)
      );
    }
    return Boolean(dayLog?.completed);
  }).length;

  return (
    <Container maxW="6xl" py={{ base: "6", md: "10" }}>
      <Stack gap={{ base: "5", md: "7" }}>
        <PageHeader
          actions={
            listState === "active" ? (
              <Button colorPalette="brand" onClick={openCreate}>
                <Plus aria-hidden="true" size={18} />
                {t("habits.createTitle")}
              </Button>
            ) : undefined
          }
          description={t("habits.description")}
          eyebrow={t("habits.eyebrow")}
          title={t("habits.title")}
        />

        <Stack gap="3">
          <HStack justify="space-between" wrap="wrap">
            <HStack gap="1" role="group" aria-label={t("habits.viewsLabel")}>
              {(["today", "week"] as const).map((item) => (
                <Button
                  colorPalette={view === item ? "brand" : undefined}
                  key={item}
                  onClick={() => setView(item)}
                  size="sm"
                  variant={view === item ? "subtle" : "ghost"}
                >
                  {t(`habits.views.${item}`)}
                </Button>
              ))}
            </HStack>
            <HStack gap="1" role="group" aria-label={t("habits.stateLabel")}>
              {(["active", "archived"] as const).map((item) => (
                <Button
                  key={item}
                  onClick={() => setListState(item)}
                  size="sm"
                  variant={listState === item ? "outline" : "ghost"}
                >
                  {t(`habits.states.${item}`)}
                </Button>
              ))}
            </HStack>
          </HStack>

          <Box
            bg="bg.panel"
            borderWidth="1px"
            p={{ base: "4", md: "5" }}
            rounded="l2"
          >
            <HStack align="start" justify="space-between" mb="3">
              <Box>
                <Text fontSize="lg" fontWeight="semibold">
                  {view === "today"
                    ? t("habits.todayHeading")
                    : t("habits.weekHeading")}
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  {view === "today"
                    ? t("habits.todaySummary", {
                        completed: completedToday,
                        total: todayHabits.length,
                      })
                    : formatWeek(weekDates[0], weekDates[6], i18n.language)}
                </Text>
              </Box>
              {view === "week" ? (
                <Text color="fg.muted" fontSize="sm">
                  {t("habits.weeklyTargetHint")}
                </Text>
              ) : null}
            </HStack>
            {view === "today" ? (
              <HabitTodayList
                date={today}
                habits={todayHabits}
                isArchived={listState === "archived"}
                isUpdating={isUpdating}
                logs={logs}
                onArchive={archive}
                onEdit={(habit) => {
                  setEditingHabit(habit);
                  setIsFormOpen(true);
                }}
                onWriteProgress={writeProgress}
              />
            ) : habits.length ? (
              <HabitWeeklyView
                dates={weekDates}
                habits={habits}
                isArchived={listState === "archived"}
                isUpdating={isUpdating}
                logs={logs}
                onArchive={archive}
                onEdit={(habit) => {
                  setEditingHabit(habit);
                  setIsFormOpen(true);
                }}
              />
            ) : (
              <Text color="fg.muted" py="5">
                {t("habits.weekEmpty")}
              </Text>
            )}
          </Box>
        </Stack>
      </Stack>
      <HabitFormDialog
        habit={editingHabit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingHabit(undefined);
        }}
        onSubmit={saveHabit}
        open={isFormOpen}
      />
    </Container>
  );
}
