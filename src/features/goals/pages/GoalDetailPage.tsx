import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";
import { Archive, ArrowLeft, Check, Pencil, Plus, Unlink } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ErrorState } from "@/components/shared/ErrorState/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { toast } from "@/components/ui/Toaster/Toaster";
import { getFocusTimerSnapshot } from "@/features/focus/services/focus-timer.service";
import { GoalFormDialog } from "@/features/goals/components/GoalFormDialog";
import {
  useArchiveGoal,
  useGoal,
  useUpdateGoal,
} from "@/features/goals/hooks/use-goals";
import {
  getGoalFocusSummary,
  getGoalProgressSummary,
} from "@/features/goals/services/goal-progress.service";
import type {
  CreateGoalInput,
  GoalStatus,
} from "@/features/goals/types/goals.types";
import {
  useCreateTask,
  useTasks,
  useUpdateTask,
} from "@/features/tasks/hooks/use-tasks";
import type { Task } from "@/features/tasks/types/tasks.types";

function formatTargetDate(date: string, locale: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day, 12));
}

function formatFocusTime(
  seconds: number,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours) return t("goals.focusDuration", { hours, minutes });
  return t("goals.focusMinutes", { minutes });
}

type GoalDetailPageProps = { goalId: string };

export function GoalDetailPage({ goalId }: GoalDetailPageProps) {
  const { i18n, t } = useTranslation();
  const goalQuery = useGoal(goalId);
  const linkedTasksQuery = useTasks({ goalId });
  const allTasksQuery = useTasks();
  const updateGoalMutation = useUpdateGoal();
  const archiveGoalMutation = useArchiveGoal();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const focusSnapshot = useState(() => getFocusTimerSnapshot())[0];
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskToLink, setTaskToLink] = useState("");
  const [manualProgress, setManualProgress] = useState(0);
  const goal = goalQuery.data;

  useEffect(() => {
    if (goal?.progressStrategy.mode === "manual") {
      setManualProgress(goal.progress);
    }
  }, [goal?.progress, goal?.progressStrategy.mode]);

  if (goalQuery.isPending) return null;
  if (goalQuery.isError) {
    return (
      <Container maxW="5xl" py={{ base: "8", md: "12" }}>
        <ErrorState onRetry={() => void goalQuery.refetch()} />
      </Container>
    );
  }

  if (!goal) return null;
  const linkedTasks = linkedTasksQuery.data ?? [];
  const allTasks = allTasksQuery.data ?? [];
  const taskDataAvailable =
    linkedTasksQuery.isSuccess && allTasksQuery.isSuccess;
  const unlinkedTasks = allTasks.filter((task) => task.goalId !== goal.id);
  const progress = getGoalProgressSummary(goal, linkedTasks, taskDataAvailable);
  const focus = getGoalFocusSummary(goal.id, focusSnapshot);
  const isCompleted = goal.status === "completed";

  function setStatus(status: GoalStatus) {
    updateGoalMutation.mutate(
      { goalId, status },
      {
        onError: () => toast.error({ title: t("goals.updateError") }),
        onSuccess: () =>
          status === "completed"
            ? toast.success({ title: t("goals.completed") })
            : undefined,
      },
    );
  }

  function saveGoal(input: CreateGoalInput) {
    updateGoalMutation.mutate(
      { ...input, goalId },
      {
        onError: () => toast.error({ title: t("goals.updateError") }),
        onSuccess: () => setIsFormOpen(false),
      },
    );
  }

  function saveManualProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateGoalMutation.mutate(
      {
        goalId,
        progress: Math.max(0, Math.min(100, Math.round(manualProgress))),
      },
      {
        onError: () => toast.error({ title: t("goals.updateError") }),
        onSuccess: () => toast.success({ title: t("goals.progressSaved") }),
      },
    );
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;
    createTaskMutation.mutate(
      { title, goalId },
      {
        onError: () => toast.error({ title: t("goals.taskUpdateError") }),
        onSuccess: () => setNewTaskTitle(""),
      },
    );
  }

  function changeTaskStatus(task: Task, completed: boolean) {
    updateTaskMutation.mutate(
      { taskId: task.id, status: completed ? "completed" : "todo" },
      { onError: () => toast.error({ title: t("goals.taskUpdateError") }) },
    );
  }

  function linkTask(taskId: string, selectedGoalId: string | undefined) {
    if (!taskId) return;
    updateTaskMutation.mutate(
      { taskId, goalId: selectedGoalId ?? null },
      {
        onError: () => toast.error({ title: t("goals.taskUpdateError") }),
        onSuccess: () => setTaskToLink(""),
      },
    );
  }

  return (
    <Container maxW="5xl" py={{ base: "6", md: "10" }}>
      <Stack gap={{ base: "5", md: "7" }}>
        <Button alignSelf="flex-start" asChild size="sm" variant="ghost">
          <RouterLink to="/goals">
            <ArrowLeft aria-hidden="true" size={16} />
            {t("goals.backToGoals")}
          </RouterLink>
        </Button>
        <PageHeader
          actions={
            <>
              {!isCompleted && goal.status !== "archived" ? (
                <Button
                  colorPalette="brand"
                  disabled={updateGoalMutation.isPending}
                  onClick={() => setStatus("completed")}
                  size="sm"
                >
                  <Check aria-hidden="true" size={16} />
                  {t("goals.markComplete")}
                </Button>
              ) : null}
              {goal.status === "active" ? (
                <Button
                  onClick={() => setStatus("paused")}
                  size="sm"
                  variant="outline"
                >
                  {t("goals.pause")}
                </Button>
              ) : goal.status === "paused" ? (
                <Button
                  onClick={() => setStatus("active")}
                  size="sm"
                  variant="outline"
                >
                  {t("goals.resume")}
                </Button>
              ) : null}
              <IconButton
                aria-label={t("goals.editTitle")}
                onClick={() => setIsFormOpen(true)}
                size="sm"
                title={t("goals.editTitle")}
                variant="outline"
              >
                <Pencil aria-hidden="true" size={16} />
              </IconButton>
              {goal.status !== "archived" ? (
                <IconButton
                  aria-label={t("goals.archive")}
                  disabled={archiveGoalMutation.isPending}
                  onClick={() =>
                    archiveGoalMutation.mutate(goalId, {
                      onError: () =>
                        toast.error({ title: t("goals.archiveError") }),
                      onSuccess: () =>
                        toast.success({ title: t("goals.archived") }),
                    })
                  }
                  size="sm"
                  title={t("goals.archive")}
                  variant="ghost"
                >
                  <Archive aria-hidden="true" size={16} />
                </IconButton>
              ) : null}
            </>
          }
          description={goal.description}
          eyebrow={t(`goals.status.${goal.status}`)}
          title={goal.title}
        />

        <Box
          bg="bg.panel"
          borderWidth="1px"
          p={{ base: "4", md: "5" }}
          rounded="l2"
        >
          <Stack gap="4">
            <Flex align="center" justify="space-between">
              <Text color="fg.muted" fontSize="sm">
                {t("goals.progress")}
              </Text>
              <Text fontSize="2xl" fontWeight="semibold">
                {progress.progress}%
              </Text>
            </Flex>
            <Progress.Root max={100} size="sm" value={progress.progress}>
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            {goal.progressStrategy.mode === "manual" ? (
              <form onSubmit={saveManualProgress}>
                <HStack align="center" gap="3">
                  <Input
                    aria-label={t("goals.progressPercent")}
                    disabled={
                      isCompleted ||
                      goal.status === "archived" ||
                      updateGoalMutation.isPending
                    }
                    max={100}
                    min={0}
                    onChange={(event) =>
                      setManualProgress(Number(event.target.value))
                    }
                    type="number"
                    value={manualProgress}
                    width="5rem"
                  />
                  <Text color="fg.muted" fontSize="sm">
                    {t("goals.manualProgress")}
                  </Text>
                  <Button
                    disabled={
                      isCompleted ||
                      goal.status === "archived" ||
                      updateGoalMutation.isPending ||
                      manualProgress === progress.progress
                    }
                    size="sm"
                    type="submit"
                    variant="outline"
                  >
                    {t("goals.saveProgress")}
                  </Button>
                </HStack>
              </form>
            ) : (
              <Text color="fg.muted" fontSize="sm">
                {!progress.isAvailable
                  ? t("goals.taskDataUnavailable")
                  : progress.totalTasks
                    ? t("goals.taskSummary", {
                        completed: progress.completedTasks,
                        total: progress.totalTasks,
                      })
                    : t("goals.noLinkedTasks")}
              </Text>
            )}
            <HStack color="fg.muted" gap="2" fontSize="sm">
              <Text>{t("goals.progressModesLabel")}</Text>
              <Text>
                {t(
                  `goals.modes.${goal.progressStrategy.mode === "task-based" ? "taskBased" : "manual"}`,
                )}
              </Text>
              {goal.targetDate ? (
                <Text>
                  · {t("goals.targetPrefix")}{" "}
                  {formatTargetDate(goal.targetDate, i18n.language)}
                </Text>
              ) : null}
            </HStack>
          </Stack>
        </Box>

        <Box
          bg="bg.panel"
          borderWidth="1px"
          p={{ base: "4", md: "5" }}
          rounded="l2"
        >
          <Flex align="center" justify="space-between" mb="3">
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                {t("goals.tasksTitle")}
              </Text>
              <Text color="fg.muted" fontSize="sm">
                {t("goals.taskSummary", {
                  completed: linkedTasks.filter(
                    (task) => task.status === "completed",
                  ).length,
                  total: linkedTasks.length,
                })}
              </Text>
            </Box>
          </Flex>
          <Stack gap="0">
            {linkedTasks.map((task) => (
              <Flex
                align="center"
                borderTopWidth="1px"
                gap="3"
                key={task.id}
                py="3"
              >
                <Checkbox.Root
                  checked={task.status === "completed"}
                  disabled={
                    task.status === "cancelled" || updateTaskMutation.isPending
                  }
                  onCheckedChange={(details) =>
                    changeTaskStatus(task, Boolean(details.checked))
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>{task.title}</Checkbox.Label>
                </Checkbox.Root>
                <IconButton
                  aria-label={t("goals.unlinkTask", { task: task.title })}
                  disabled={updateTaskMutation.isPending}
                  ml="auto"
                  onClick={() => linkTask(task.id, undefined)}
                  size="xs"
                  title={t("goals.unlinkTask", { task: task.title })}
                  variant="ghost"
                >
                  <Unlink aria-hidden="true" size={15} />
                </IconButton>
              </Flex>
            ))}
            {!taskDataAvailable ? (
              <Text color="fg.muted" fontSize="sm" py="3">
                {t("goals.taskDataUnavailable")}
              </Text>
            ) : linkedTasks.length === 0 ? (
              <Text color="fg.muted" fontSize="sm" py="3">
                {t("goals.noLinkedTasks")}
              </Text>
            ) : null}
          </Stack>
          <form onSubmit={handleAddTask}>
            <HStack borderTopWidth="1px" gap="2" pt="3">
              <Input
                aria-label={t("goals.newTaskTitle")}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder={t("goals.newTaskPlaceholder")}
                value={newTaskTitle}
              />
              <Button
                disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
                size="sm"
                type="submit"
                variant="outline"
              >
                <Plus aria-hidden="true" size={16} />
                {t("goals.addTask")}
              </Button>
            </HStack>
          </form>
          {unlinkedTasks.length ? (
            <HStack borderTopWidth="1px" gap="2" mt="3" pt="3">
              <NativeSelect.Root>
                <NativeSelect.Field
                  aria-label={t("goals.linkExistingTask")}
                  onChange={(event) => setTaskToLink(event.target.value)}
                  value={taskToLink}
                >
                  <option value="">{t("goals.chooseTask")}</option>
                  {unlinkedTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Button
                disabled={!taskToLink || updateTaskMutation.isPending}
                onClick={() => linkTask(taskToLink, goalId)}
                size="sm"
                variant="outline"
              >
                {t("goals.linkTask")}
              </Button>
            </HStack>
          ) : null}
        </Box>

        <Box
          bg="bg.panel"
          borderWidth="1px"
          p={{ base: "4", md: "5" }}
          rounded="l2"
        >
          <Text fontSize="lg" fontWeight="semibold">
            {t("goals.focusTitle")}
          </Text>
          <Text color="fg.muted" mt="2">
            {focus.sessionCount
              ? t("goals.focusSummary", {
                  duration: formatFocusTime(focus.totalSeconds, t),
                  sessions: focus.sessionCount,
                })
              : t("goals.focusEmpty")}
          </Text>
        </Box>
      </Stack>
      <GoalFormDialog
        goal={goal}
        isSubmitting={updateGoalMutation.isPending}
        onOpenChange={setIsFormOpen}
        onSubmit={saveGoal}
        open={isFormOpen}
      />
    </Container>
  );
}
