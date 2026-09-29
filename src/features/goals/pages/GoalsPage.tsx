import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { APP_ROUTES } from "@/lib/routes";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { GoalsListSkeleton } from "@/features/goals/components/GoalsListSkeleton";
import { ErrorState } from "@/components/shared/ErrorState/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { toast } from "@/components/ui/Toaster/Toaster";
import { GoalFormDialog } from "@/features/goals/components/GoalFormDialog";
import { useCreateGoal, useGoals } from "@/features/goals/hooks/use-goals";
import { GoalDetailPage } from "@/features/goals/pages/GoalDetailPage";
import { getGoalProgressSummary } from "@/features/goals/services/goal-progress.service";
import type {
  CreateGoalInput,
  GoalStatus,
} from "@/features/goals/types/goals.types";
import { useTasks } from "@/features/tasks/hooks/use-tasks";

const statuses: Array<GoalStatus | "all"> = [
  "active",
  "paused",
  "completed",
  "archived",
  "all",
];

function formatTargetDate(date: string, locale: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day, 12));
}

export function GoalsPage() {
  const { goalId } = useSearch({ from: APP_ROUTES.goals });
  if (goalId) return <GoalDetailPage goalId={goalId} key={goalId} />;
  return <GoalsListPage />;
}

function GoalsListPage() {
  const { i18n, t } = useTranslation();
  const [status, setStatus] = useState<GoalStatus | "all">("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const goalsQuery = useGoals(status === "all" ? {} : { status });
  const tasksQuery = useTasks();
  const createMutation = useCreateGoal();

  if (goalsQuery.isPending) return <GoalsListSkeleton />;
  if (goalsQuery.isError) {
    return (
      <Container maxW="6xl" py={{ base: "8", md: "12" }}>
        <ErrorState onRetry={() => void goalsQuery.refetch()} />
      </Container>
    );
  }

  const goals = goalsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  function handleCreate(input: CreateGoalInput) {
    createMutation.mutate(input, {
      onError: () => toast.error({ title: t("goals.createError") }),
      onSuccess: () => {
        setIsFormOpen(false);
        toast.success({ title: t("goals.created") });
      },
    });
  }

  return (
    <Container maxW="5xl" py={{ base: "6", md: "10" }}>
      <Stack gap={{ base: "5", md: "7" }}>
        <PageHeader
          actions={
            <Button colorPalette="brand" onClick={() => setIsFormOpen(true)}>
              <Plus aria-hidden="true" size={18} />
              {t("goals.createTitle")}
            </Button>
          }
          description={t("goals.description")}
          eyebrow={t("goals.eyebrow")}
          title={t("goals.title")}
        />
        <HStack
          gap="1"
          overflowX="auto"
          pb="1"
          role="group"
          aria-label={t("goals.statusFilter")}
        >
          {statuses.map((item) => (
            <Button
              colorPalette={status === item ? "brand" : undefined}
              key={item}
              onClick={() => setStatus(item)}
              size="sm"
              variant={status === item ? "subtle" : "ghost"}
            >
              {t(item === "all" ? "goals.allStatuses" : `goals.status.${item}`)}
            </Button>
          ))}
        </HStack>
        {goals.length === 0 ? (
          <EmptyState
            description={t("goals.emptyDescription")}
            title={t("goals.emptyTitle")}
          />
        ) : (
          <Stack
            bg="bg.panel"
            borderWidth="1px"
            px={{ base: "4", md: "5" }}
            rounded="l2"
          >
            {goals.map((goal) => {
              const summary = getGoalProgressSummary(
                goal,
                tasks,
                tasksQuery.isSuccess,
              );
              return (
                <RouterLink
                  key={goal.id}
                  search={{ goalId: goal.id }}
                  style={{ color: "inherit", textDecoration: "none" }}
                  to={APP_ROUTES.goals}
                >
                  <Stack
                    borderBottomWidth="1px"
                    gap="2"
                    py="4"
                    _last={{ borderBottomWidth: "0" }}
                    _hover={{ bg: "bg.subtle" }}
                    px="2"
                  >
                    <Flex align="start" gap="4" justify="space-between">
                      <Box minW="0">
                        <Text fontWeight="semibold" lineClamp={1}>
                          {goal.title}
                        </Text>
                        {goal.description ? (
                          <Text
                            color="fg.muted"
                            fontSize="sm"
                            lineClamp={1}
                            mt="1"
                          >
                            {goal.description}
                          </Text>
                        ) : null}
                      </Box>
                      <Text flexShrink="0" fontSize="lg" fontWeight="semibold">
                        {summary.progress}%
                      </Text>
                    </Flex>
                    <Progress.Root max={100} size="sm" value={summary.progress}>
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Flex
                      align="center"
                      color="fg.muted"
                      fontSize="xs"
                      gap="2"
                      justify="space-between"
                      wrap="wrap"
                    >
                      <Text>
                        {goal.progressStrategy.mode === "task-based"
                          ? summary.totalTasks
                            ? t("goals.taskSummary", {
                                completed: summary.completedTasks,
                                total: summary.totalTasks,
                              })
                            : t("goals.noLinkedTasks")
                          : summary.isAvailable
                            ? t("goals.manualProgress")
                            : t("goals.taskDataUnavailable")}
                      </Text>
                      <HStack gap="3">
                        <Text>{t(`goals.status.${goal.status}`)}</Text>
                        {goal.targetDate ? (
                          <Text>
                            {t("goals.targetPrefix")}{" "}
                            {formatTargetDate(goal.targetDate, i18n.language)}
                          </Text>
                        ) : null}
                      </HStack>
                    </Flex>
                  </Stack>
                </RouterLink>
              );
            })}
          </Stack>
        )}
      </Stack>
      <GoalFormDialog
        isSubmitting={createMutation.isPending}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreate}
        open={isFormOpen}
      />
    </Container>
  );
}
