import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Grid,
  HStack,
  IconButton,
  Image,
  Input,
  NativeSelect,
  Progress,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  Archive,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  FileUp,
  Flag,
  Lightbulb,
  ListChecks,
  Pause,
  Pencil,
  Play,
  Plus,
  Square,
  Target,
  Timer,
  Trophy,
  Unlink,
  Waves,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import { toast } from '@/components/ui/Toaster/Toaster'
import { getFocusTimerSnapshot } from '@/features/focus/services/focus-timer.service'
import { GoalDetailMetric } from '@/features/goals/components/GoalDetailMetric'
import { GoalDetailSkeleton } from '@/features/goals/components/GoalDetailSkeleton'
import { GoalDetailsHeader } from '@/features/goals/components/GoalDetailsHeader'
import { GoalFormDialog } from '@/features/goals/components/GoalFormDialog'
import {
  type GoalPlanEntry,
  GoalPlanningDialog,
} from '@/features/goals/components/GoalPlanningDialog'
import {
  GoalRecentActivityDrawer,
  getGoalRecentActivity,
} from '@/features/goals/components/GoalRecentActivityDrawer'
import { GoalTasksDialog } from '@/features/goals/components/GoalTasksDialog/GoalTasksDialog'
import { MilestonesDrawer } from '@/features/goals/components/MilestonesDrawer'
import { TaskImportDialog } from '@/features/goals/components/TaskImportDialog'
import {
  useArchiveGoal,
  useGoal,
  useUpdateGoal,
} from '@/features/goals/hooks/use-goals'
import {
  getEndTime,
  getPlanningWeekDates,
} from '@/features/goals/services/goal-planning.service'
import {
  getGoalFocusSummary,
  getGoalProgressSummary,
} from '@/features/goals/services/goal-progress.service'
import type {
  CreateGoalInput,
  GoalStatus,
} from '@/features/goals/types/goals.types'
import {
  formatGoalElapsedTime,
  formatGoalFocusTime,
  formatGoalTargetDate,
  getGoalFocusElapsedSeconds,
} from '@/features/goals/utils/goals.utils'
import {
  useAllTimeBlocks,
  useCreateTimeBlock,
} from '@/features/planner/hooks/use-planner'
import { TaskFormDialog } from '@/features/tasks/components/TaskFormDialog'
import { TaskListItem } from '@/features/tasks/components/TaskListItem'
import {
  useCreateTask,
  useTasks,
  useUpdateTask,
} from '@/features/tasks/hooks/use-tasks'
import type {
  Task,
  TaskFormSubmitInput,
} from '@/features/tasks/types/tasks.types'
import {
  useStartFocusSession,
  useStopFocusSession,
  useTodayDashboard,
  useUpdateFocusSession,
} from '@/features/today/hooks/use-today-dashboard'

type GoalDetailPageProps = { goalId: string }

export const GoalDetailPage = ({ goalId }: GoalDetailPageProps) => {
  const { i18n, t } = useTranslation()
  const goalQuery = useGoal(goalId)
  const linkedTasksQuery = useTasks({ goalId })
  const allTasksQuery = useTasks()
  const updateGoalMutation = useUpdateGoal()
  const archiveGoalMutation = useArchiveGoal()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const createTimeBlockMutation = useCreateTimeBlock()
  const startFocusMutation = useStartFocusSession()
  const updateFocusMutation = useUpdateFocusSession()
  const stopFocusMutation = useStopFocusSession()
  const focusDashboardQuery = useTodayDashboard()
  const focusSnapshot = useState(() => getFocusTimerSnapshot())[0]
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isGoalTasksDialogOpen, setIsGoalTasksDialogOpen] = useState(false)
  const [isPlanningOpen, setIsPlanningOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task>()
  const [taskToUnlink, setTaskToUnlink] = useState<Task>()
  const [taskToLink, setTaskToLink] = useState('')
  const [manualProgress, setManualProgress] = useState(0)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isMilestonesDrawerOpen, setIsMilestonesDrawerOpen] = useState(false)
  const [isRecentActivityDrawerOpen, setIsRecentActivityDrawerOpen] =
    useState(false)
  const [focusNow, setFocusNow] = useState(Date.now())
  const goal = goalQuery.data
  const planningWeek = getPlanningWeekDates()
  const plannerBlocksQuery = useAllTimeBlocks(
    planningWeek[0],
    planningWeek[planningWeek.length - 1],
  )

  useEffect(() => {
    if (goal?.progressStrategy.mode === 'manual') {
      setManualProgress(goal.progress)
    }
  }, [goal?.progress, goal?.progressStrategy.mode])

  useEffect(() => {
    if (focusDashboardQuery.data?.activeFocusSession?.status !== 'active')
      return undefined
    const intervalId = window.setInterval(() => setFocusNow(Date.now()), 1_000)
    return () => window.clearInterval(intervalId)
  }, [focusDashboardQuery.data?.activeFocusSession?.status])

  if (goalQuery.isPending) return <GoalDetailSkeleton />
  if (goalQuery.isError) {
    return (
      <Container maxW="5xl" py={{ base: '8', md: '12' }}>
        <ErrorState onRetry={() => void goalQuery.refetch()} />
      </Container>
    )
  }

  if (!goal) return null
  const linkedTasks = linkedTasksQuery.data ?? []
  const allTasks = allTasksQuery.data ?? []
  const taskDataAvailable =
    linkedTasksQuery.isSuccess && allTasksQuery.isSuccess
  const unlinkedTasks = allTasks.filter((task) => task.goalId !== goal.id)
  const progress = getGoalProgressSummary(goal, linkedTasks, taskDataAvailable)
  const focus = getGoalFocusSummary(goal.id, focusSnapshot)
  const recentActivity = getGoalRecentActivity(goal.id, focusSnapshot)
  const focusAvailable =
    !focusDashboardQuery.data?.activeFocusSession &&
    !startFocusMutation.isPending
  const activeFocusSession =
    focusDashboardQuery.data?.activeFocusSession ?? null
  const scheduledGoalBlocks = (plannerBlocksQuery.data ?? []).filter(
    (block) => block.goalId === goalId && block.taskId,
  )
  const isCompleted = goal.status === 'completed'
  const completedTasks = linkedTasks.filter(
    (task) => task.status === 'completed',
  ).length
  const completedMilestones = linkedTasks.filter(
    (task) => task.status === 'completed',
  )
  const remainingTasks = Math.max(0, linkedTasks.length - completedTasks)
  const remainingDays = goal.targetDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(`${goal.targetDate}T12:00:00`).getTime() - Date.now()) /
            86_400_000,
        ),
      )
    : null
  const estimatedHours = Math.round(
    linkedTasks.reduce(
      (total, task) => total + (task.estimatedMinutes ?? 0),
      0,
    ) / 60,
  )

  const setStatus = (status: GoalStatus) => {
    updateGoalMutation.mutate(
      { goalId, status },
      {
        onError: () => toast.error({ title: t('goals.updateError') }),
        onSuccess: () =>
          status === 'completed'
            ? toast.success({ title: t('goals.completed') })
            : undefined,
      },
    )
  }

  const saveGoal = (input: CreateGoalInput) => {
    updateGoalMutation.mutate(
      { ...input, goalId },
      {
        onError: () => toast.error({ title: t('goals.updateError') }),
        onSuccess: () => setIsFormOpen(false),
      },
    )
  }

  const saveManualProgress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateGoalMutation.mutate(
      {
        goalId,
        progress: Math.max(0, Math.min(100, Math.round(manualProgress))),
      },
      {
        onError: () => toast.error({ title: t('goals.updateError') }),
        onSuccess: () => toast.success({ title: t('goals.progressSaved') }),
      },
    )
  }

  const saveTask = (input: TaskFormSubmitInput) => {
    const action = taskToEdit
      ? updateTaskMutation.mutate(
          { ...input, goalId, taskId: taskToEdit.id, title: input.title },
          {
            onError: () => toast.error({ title: t('goals.taskUpdateError') }),
            onSuccess: () => {
              setIsTaskFormOpen(false)
              setTaskToEdit(undefined)
            },
          },
        )
      : createTaskMutation.mutate(
          { ...input, goalId },
          {
            onError: () => toast.error({ title: t('goals.taskUpdateError') }),
            onSuccess: () => setIsTaskFormOpen(false),
          },
        )
    return action
  }

  const closeTaskForm = (open: boolean) => {
    setIsTaskFormOpen(open)
    if (!open) setTaskToEdit(undefined)
  }

  const openCreateTask = () => {
    setTaskToEdit(undefined)
    setIsTaskFormOpen(true)
  }

  const openEditTask = (task: Task) => {
    setTaskToEdit(task)
    setIsTaskFormOpen(true)
  }

  const confirmGoalPlan = async (entries: GoalPlanEntry[]) => {
    const freshTasksResult = await linkedTasksQuery.refetch()
    const freshTasks = freshTasksResult.data ?? []
    const tasksById = new Map(freshTasks.map((task) => [task.id, task]))
    const unavailableTasks = entries.filter(
      (entry) => !tasksById.has(entry.taskId),
    )

    if (unavailableTasks.length) {
      toast.error({
        title: t('goals.planning.tasksUnavailable', {
          count: unavailableTasks.length,
        }),
      })
      return false
    }

    for (const entry of entries) {
      const task = tasksById.get(entry.taskId)
      if (!task) continue

      try {
        await createTimeBlockMutation.mutateAsync({
          date: entry.date,
          endTime: getEndTime(entry.startTime, entry.durationMinutes),
          goalId,
          startTime: entry.startTime,
          taskId: task.id,
          title: task.title,
        })
      } catch {
        toast.error({ title: t('goals.planning.saveError') })
        return false
      }
    }
    setIsPlanningOpen(false)
    toast.success({ title: t('goals.planning.saved') })
    return true
  }

  const startFocus = (task: Task) => {
    startFocusMutation.mutate(
      { taskId: task.id },
      { onError: () => toast.error({ title: t('goals.taskUpdateError') }) },
    )
  }

  const changeTaskStatus = (task: Task, completed: boolean) => {
    updateTaskMutation.mutate(
      {
        taskId: task.id,
        status: completed ? 'completed' : 'todo',
        title: task.title,
      },
      { onError: () => toast.error({ title: t('goals.taskUpdateError') }) },
    )
  }

  const linkTask = (taskId: string, selectedGoalId: string | undefined) => {
    const task = allTasks.find((item) => item.id === taskId)
    if (!task) return
    updateTaskMutation.mutate(
      { taskId, goalId: selectedGoalId ?? null, title: task.title },
      {
        onError: () => toast.error({ title: t('goals.taskUpdateError') }),
        onSuccess: () => {
          setTaskToLink('')
          if (!selectedGoalId) setTaskToUnlink(undefined)
        },
      },
    )
  }

  return (
    <Container maxW="full" px={{ base: '3', md: '4' }} py="3">
      <Stack gap="3">
        <GoalDetailsHeader
          goal={goal}
          isArchiving={archiveGoalMutation.isPending}
          isUpdating={updateGoalMutation.isPending}
          onAddTask={openCreateTask}
          onPlanGoal={() => setIsPlanningOpen(true)}
          onArchive={() =>
            archiveGoalMutation.mutate(goalId, {
              onError: () => toast.error({ title: t('goals.archiveError') }),
              onSuccess: () => toast.success({ title: t('goals.archived') }),
            })
          }
          onEdit={() => setIsFormOpen(true)}
          onSetStatus={setStatus}
        />
        <Box
          display="none"
          bg="bg.panel"
          borderColor="border.subtle"
          borderWidth="1px"
          p={{ base: '4', md: '5' }}
          rounded="l3"
          shadow="xs"
        >
          <Flex
            align={{ base: 'start', lg: 'center' }}
            direction={{ base: 'column', lg: 'row' }}
            gap="4"
            justify="space-between"
          >
            <HStack align="center" gap={{ base: '3', md: '4' }}>
              {goal.goalImageUrl ? (
                <Image
                  alt=""
                  borderColor="brand.border"
                  borderWidth="1px"
                  boxSize={{ base: '14', md: '20' }}
                  objectFit="cover"
                  rounded="l2"
                  src={goal.goalImageUrl}
                />
              ) : (
                <Flex
                  align="center"
                  bg="brand.muted"
                  borderColor="brand.border"
                  borderWidth="1px"
                  color="brand.fg"
                  h={{ base: '14', md: '20' }}
                  justify="center"
                  rounded="l2"
                  w={{ base: '14', md: '20' }}
                >
                  <Trophy aria-hidden="true" size={34} />
                </Flex>
              )}
              <Box>
                <HStack gap="2" mb="1">
                  <Text
                    color="fg.muted"
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    {t('goals.title')}
                  </Text>
                  <Text
                    bg={
                      goal.status === 'active' ? 'success.subtle' : 'bg.subtle'
                    }
                    color={goal.status === 'active' ? 'success.fg' : 'fg.muted'}
                    fontSize="xs"
                    fontWeight="semibold"
                    px="2"
                    py="0.5"
                    rounded="full"
                  >
                    {goal.status === 'active'
                      ? t('goals.onTrack')
                      : t(`goals.status.${goal.status}`)}
                  </Text>
                </HStack>
                <Text
                  fontSize={{ base: 'xl', md: '2xl' }}
                  fontWeight="bold"
                  letterSpacing="tight"
                >
                  <PrivateText>{goal.title}</PrivateText>
                </Text>
              </Box>
            </HStack>
            <HStack flexWrap="wrap" gap="2">
              {goal.status !== 'archived' ? (
                <Button colorPalette="brand" onClick={openCreateTask} size="sm">
                  <Check aria-hidden="true" size={16} />
                  {t('goals.addTask')}
                </Button>
              ) : null}
              {goal.status !== 'archived' ? (
                <Button
                  onClick={() => setIsPlanningOpen(true)}
                  size="sm"
                  variant="outline"
                >
                  <CalendarDays aria-hidden="true" size={16} />
                  {t('goals.planning.trigger')}
                </Button>
              ) : null}

              {!isCompleted && goal.status !== 'archived' ? (
                <Button
                  disabled={updateGoalMutation.isPending}
                  onClick={() => setStatus('completed')}
                  size="sm"
                  variant="outline"
                >
                  {t('goals.markComplete')}
                </Button>
              ) : null}
              {goal.status === 'active' ? (
                <Button
                  onClick={() => setStatus('paused')}
                  size="sm"
                  variant="ghost"
                >
                  {t('goals.pause')}
                </Button>
              ) : goal.status === 'paused' ? (
                <Button
                  onClick={() => setStatus('active')}
                  size="sm"
                  variant="ghost"
                >
                  {t('goals.resume')}
                </Button>
              ) : null}
              <IconButton
                aria-label={t('goals.editTitle')}
                onClick={() => setIsFormOpen(true)}
                size="sm"
                title={t('goals.editTitle')}
                variant="outline"
              >
                <Pencil aria-hidden="true" size={16} />
              </IconButton>
              {goal.status !== 'archived' ? (
                <IconButton
                  aria-label={t('goals.archive')}
                  colorPalette="danger"
                  disabled={archiveGoalMutation.isPending}
                  onClick={() =>
                    archiveGoalMutation.mutate(goalId, {
                      onError: () =>
                        toast.error({ title: t('goals.archiveError') }),
                      onSuccess: () =>
                        toast.success({ title: t('goals.archived') }),
                    })
                  }
                  size="sm"
                  title={t('goals.archive')}
                  variant="outline"
                >
                  <Archive aria-hidden="true" size={16} />
                </IconButton>
              ) : null}
            </HStack>
          </Flex>
        </Box>

        <Grid
          alignItems="start"
          gap="3"
          templateColumns={{
            base: '1fr',
            xl: 'minmax(0, 1.8fr) minmax(21rem, 1fr)',
          }}
        >
          <Stack gap="3" minW="0">
            <Grid
              gap="3"
              order="2"
              templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }}
            >
              <GoalDetailMetric
                icon={ListChecks}
                label={t('goals.remainingTasks')}
                value={remainingTasks}
              />
              <GoalDetailMetric
                icon={CalendarDays}
                label={t('goals.daysRemaining')}
                value={remainingDays ?? '—'}
              />
              <GoalDetailMetric
                icon={Timer}
                label={t('goals.focusTitle')}
                value={focus.sessionCount}
              />
              <GoalDetailMetric
                icon={Clock3}
                label={t('goals.estimatedEffort')}
                value={estimatedHours ? `${estimatedHours}h` : '—'}
              />
            </Grid>

            <Box
              bg="bg.panel"
              borderWidth="1px"
              order="1"
              p={{ base: '4', md: '5' }}
              rounded="l2"
            >
              <Stack gap="4">
                <Flex align="center" justify="space-between">
                  <Text color="fg.muted" fontSize="sm">
                    {t('goals.progress')}
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
                {goal.progressStrategy.mode === 'manual' ? (
                  <form onSubmit={saveManualProgress}>
                    <HStack align="center" gap="3">
                      <Input
                        aria-label={t('goals.progressPercent')}
                        disabled={
                          isCompleted ||
                          goal.status === 'archived' ||
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
                        {t('goals.manualProgress')}
                      </Text>
                      <Button
                        disabled={
                          isCompleted ||
                          goal.status === 'archived' ||
                          updateGoalMutation.isPending ||
                          manualProgress === progress.progress
                        }
                        size="sm"
                        type="submit"
                        variant="outline"
                      >
                        {t('goals.saveProgress')}
                      </Button>
                    </HStack>
                  </form>
                ) : (
                  <Text color="fg.muted" fontSize="sm">
                    {!progress.isAvailable
                      ? t('goals.taskDataUnavailable')
                      : progress.totalTasks
                        ? t('goals.taskSummary', {
                            completed: progress.completedTasks,
                            total: progress.totalTasks,
                          })
                        : t('goals.noLinkedTasks')}
                  </Text>
                )}
                <HStack color="fg.muted" gap="2" fontSize="sm">
                  <Text>{t('goals.progressModesLabel')}</Text>
                  <Text>
                    {t(
                      `goals.modes.${goal.progressStrategy.mode === 'task-based' ? 'taskBased' : 'manual'}`,
                    )}
                  </Text>
                  {goal.targetDate ? (
                    <Text>
                      · {t('goals.targetPrefix')}{' '}
                      {formatGoalTargetDate(goal.targetDate, i18n.language)}
                    </Text>
                  ) : null}
                </HStack>
              </Stack>
            </Box>

            <Box
              bg="bg.panel"
              borderWidth="1px"
              order="3"
              p={{ base: '4', md: '5' }}
              rounded="l2"
            >
              <Flex align="center" justify="space-between" mb="3">
                <Box>
                  <Text fontSize="lg" fontWeight="semibold">
                    {t('goals.tasksTitle')}
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    {t('goals.taskSummary', {
                      completed: linkedTasks.filter(
                        (task) => task.status === 'completed',
                      ).length,
                      total: linkedTasks.length,
                    })}
                  </Text>
                  {scheduledGoalBlocks.length ? (
                    <Text color="brand.fg" fontSize="xs">
                      {t('goals.planning.scheduled', {
                        count: scheduledGoalBlocks.length,
                      })}
                    </Text>
                  ) : null}
                </Box>
                <HStack gap="2">
                  {linkedTasks.length > 5 ? (
                    <Button
                      onClick={() => setIsGoalTasksDialogOpen(true)}
                      size="sm"
                      variant="ghost"
                    >
                      {t('goals.viewAll')}{' '}
                      <ChevronRight aria-hidden="true" size={14} />
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => setIsImportOpen(true)}
                    size="sm"
                    variant="outline"
                  >
                    <FileUp aria-hidden="true" size={16} />
                    Import tasks
                  </Button>
                </HStack>
              </Flex>
              <Stack gap="3">
                {linkedTasks.slice(0, 5).map((task) => (
                  <TaskListItem
                    activeFocusSession={activeFocusSession}
                    focusAvailable={focusAvailable}
                    isMutating={updateTaskMutation.isPending}
                    key={task.id}
                    onDelete={() => setTaskToUnlink(task)}
                    onEdit={() => openEditTask(task)}
                    onSecondaryAction={() => setTaskToUnlink(task)}
                    onStartFocus={() => startFocus(task)}
                    onToggleCompletion={() =>
                      changeTaskStatus(task, task.status !== 'completed')
                    }
                    secondaryActionIcon={
                      <Unlink aria-hidden="true" size={15} />
                    }
                    secondaryActionLabel={t('goals.unlinkTask', {
                      task: task.title,
                    })}
                    task={task}
                  />
                ))}
                {false
                  ? linkedTasks.slice(0, 5).map((task) =>
                      (() => {
                        const isFocusedTask = Boolean(
                          activeFocusSession &&
                            (activeFocusSession.taskId === task.id ||
                              (!activeFocusSession.taskId &&
                                activeFocusSession.taskTitle === task.title)),
                        )
                        const elapsedSeconds =
                          activeFocusSession && isFocusedTask
                            ? getGoalFocusElapsedSeconds(
                                activeFocusSession.elapsedSeconds,
                                activeFocusSession.startedAt,
                                activeFocusSession.status,
                                focusNow,
                              )
                            : 0
                        const isFocusRunning =
                          activeFocusSession?.status === 'active'
                        const targetSeconds = Math.max(
                          1,
                          (task.estimatedMinutes ?? 60) * 60,
                        )

                        return (
                          <Flex
                            align={{ base: 'start', md: 'center' }}
                            bg={
                              isFocusedTask
                                ? 'brand.subtle'
                                : task.status === 'completed'
                                  ? 'bg.subtle'
                                  : 'bg.elevated'
                            }
                            borderColor={
                              isFocusedTask ? 'brand.border' : 'border.subtle'
                            }
                            borderWidth="1px"
                            gap="3"
                            justify="space-between"
                            key={task.id}
                            p={{ base: '3', md: '4' }}
                            rounded="l2"
                          >
                            <Checkbox.Root
                              checked={task.status === 'completed'}
                              disabled={
                                task.status === 'cancelled' ||
                                updateTaskMutation.isPending
                              }
                              onCheckedChange={(details) =>
                                changeTaskStatus(task, Boolean(details.checked))
                              }
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control mt="1" />
                            </Checkbox.Root>
                            <Stack flex="1" gap="2" minW="0">
                              <Box>
                                <Text
                                  fontWeight="semibold"
                                  textDecoration={
                                    task.status === 'completed'
                                      ? 'line-through'
                                      : undefined
                                  }
                                >
                                  <PrivateText>{task.title}</PrivateText>
                                </Text>
                                {task.description ? (
                                  <Text
                                    color="fg.muted"
                                    fontSize="sm"
                                    lineClamp={1}
                                    mt="1"
                                  >
                                    {task.description}
                                  </Text>
                                ) : null}
                              </Box>
                              <HStack
                                color="fg.muted"
                                fontSize="xs"
                                gap="2"
                                wrap="wrap"
                              >
                                <Badge
                                  colorPalette={
                                    task.priority === 'high'
                                      ? 'red'
                                      : task.priority === 'medium'
                                        ? 'yellow'
                                        : 'gray'
                                  }
                                  size="sm"
                                  variant="subtle"
                                >
                                  {t(`tasks.priority.${task.priority}`)}
                                </Badge>
                                {task.dueDate ? (
                                  <HStack gap="1">
                                    <CalendarDays
                                      aria-hidden="true"
                                      size={13}
                                    />
                                    <Text>
                                      {formatGoalTargetDate(
                                        task.dueDate,
                                        i18n.language,
                                      )}
                                    </Text>
                                  </HStack>
                                ) : null}
                                {task.estimatedMinutes ? (
                                  <HStack gap="1">
                                    <Clock3 aria-hidden="true" size={13} />
                                    <Text>
                                      {task.estimatedMinutes >= 60
                                        ? `${Math.round(task.estimatedMinutes / 60)}h`
                                        : `${task.estimatedMinutes} min`}
                                    </Text>
                                  </HStack>
                                ) : null}
                              </HStack>
                            </Stack>
                            {isFocusedTask && activeFocusSession ? (
                              <Stack
                                bg="bg.panel"
                                borderColor="brand.border"
                                borderWidth="1px"
                                flexShrink="0"
                                gap="2"
                                p="3"
                                rounded="l2"
                                w={{ base: 'full', lg: '18rem' }}
                              >
                                <HStack
                                  color="brand.fg"
                                  justify="space-between"
                                >
                                  <HStack gap="1">
                                    <Timer aria-hidden="true" size={15} />
                                    <Text fontSize="xs" fontWeight="semibold">
                                      {isFocusRunning
                                        ? t('today.focusRunning')
                                        : t('today.focusPaused')}
                                    </Text>
                                  </HStack>
                                  <Text
                                    fontSize="xs"
                                    fontVariantNumeric="tabular-nums"
                                  >
                                    {formatGoalElapsedTime(elapsedSeconds)} /{' '}
                                    {formatGoalElapsedTime(targetSeconds)}
                                  </Text>
                                </HStack>
                                <Progress.Root
                                  colorPalette="brand"
                                  size="xs"
                                  value={Math.min(
                                    100,
                                    (elapsedSeconds / targetSeconds) * 100,
                                  )}
                                >
                                  <Progress.Track>
                                    <Progress.Range />
                                  </Progress.Track>
                                </Progress.Root>
                                <HStack gap="2">
                                  <Button
                                    colorPalette="brand"
                                    disabled={
                                      updateFocusMutation.isPending ||
                                      stopFocusMutation.isPending
                                    }
                                    flex="1"
                                    onClick={() =>
                                      updateFocusMutation.mutate({
                                        elapsedSeconds,
                                        sessionId: activeFocusSession.id,
                                        status: isFocusRunning
                                          ? 'paused'
                                          : 'active',
                                      })
                                    }
                                    size="xs"
                                    variant="outline"
                                  >
                                    {isFocusRunning ? (
                                      <Pause aria-hidden="true" size={13} />
                                    ) : (
                                      <Play
                                        aria-hidden="true"
                                        fill="currentColor"
                                        size={13}
                                      />
                                    )}
                                    {isFocusRunning
                                      ? t('today.pauseFocus')
                                      : t('today.resumeFocus')}
                                  </Button>
                                  <Button
                                    colorPalette="red"
                                    disabled={
                                      updateFocusMutation.isPending ||
                                      stopFocusMutation.isPending
                                    }
                                    flex="1"
                                    onClick={() =>
                                      stopFocusMutation.mutate({
                                        elapsedSeconds,
                                        sessionId: activeFocusSession.id,
                                      })
                                    }
                                    size="xs"
                                    variant="outline"
                                  >
                                    <Square
                                      aria-hidden="true"
                                      fill="currentColor"
                                      size={11}
                                    />
                                    {t('today.stopFocus')}
                                  </Button>
                                </HStack>
                              </Stack>
                            ) : (
                              <HStack flexShrink="0" gap="2" wrap="wrap">
                                {focusAvailable &&
                                task.status !== 'completed' &&
                                task.status !== 'cancelled' ? (
                                  <Button
                                    colorPalette="brand"
                                    onClick={() => startFocus(task)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Play
                                      aria-hidden="true"
                                      fill="currentColor"
                                      size={16}
                                    />
                                    {t('tasks.startFocus')}
                                  </Button>
                                ) : null}
                                <IconButton
                                  aria-label={t('tasks.editTask')}
                                  disabled={updateTaskMutation.isPending}
                                  onClick={() => openEditTask(task)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Pencil aria-hidden="true" size={16} />
                                </IconButton>
                                <IconButton
                                  aria-label={t('goals.unlinkTask', {
                                    task: task.title,
                                  })}
                                  disabled={updateTaskMutation.isPending}
                                  onClick={() => linkTask(task.id, undefined)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Unlink aria-hidden="true" size={16} />
                                </IconButton>
                              </HStack>
                            )}
                          </Flex>
                        )
                      })(),
                    )
                  : null}
                {!taskDataAvailable ? (
                  <Text color="fg.muted" fontSize="sm" py="3">
                    {t('goals.taskDataUnavailable')}
                  </Text>
                ) : linkedTasks.length === 0 ? (
                  <Text color="fg.muted" fontSize="sm" py="3">
                    {t('goals.noLinkedTasks')}
                  </Text>
                ) : null}
              </Stack>
              <Button
                alignSelf="start"
                onClick={openCreateTask}
                variant="outline"
              >
                <Plus aria-hidden="true" size={16} />
                {t('goals.addTask')}
              </Button>
              {unlinkedTasks.length ? (
                <HStack borderTopWidth="1px" gap="2" mt="3" pt="3">
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      aria-label={t('goals.linkExistingTask')}
                      onChange={(event) => setTaskToLink(event.target.value)}
                      value={taskToLink}
                    >
                      <option value="">{t('goals.chooseTask')}</option>
                      {unlinkedTasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          <PrivateText>{task.title}</PrivateText>
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
                    {t('goals.linkTask')}
                  </Button>
                </HStack>
              ) : null}
            </Box>

            <Box
              bg="bg.panel"
              borderWidth="1px"
              display="none"
              p={{ base: '4', md: '5' }}
              rounded="l2"
            >
              <Text fontSize="lg" fontWeight="semibold">
                {t('goals.focusTitle')}
              </Text>
              <Text color="fg.muted" mt="2">
                {focus.sessionCount
                  ? t('goals.focusSummary', {
                      duration: formatGoalFocusTime(focus.totalSeconds, t),
                      sessions: focus.sessionCount,
                    })
                  : t('goals.focusEmpty')}
              </Text>
            </Box>
          </Stack>
          <Stack gap="3">
            <Box
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              p="4"
              rounded="l2"
            >
              <HStack gap="2" mb="2">
                <Lightbulb aria-hidden="true" color="brand.fg" size={18} />
                <Text fontWeight="semibold">{t('goals.insights')}</Text>
              </HStack>
              {goal.targetDate ? (
                <Flex borderTopWidth="1px" gap="3" py="3">
                  <CalendarDays aria-hidden="true" color="brand.fg" size={16} />
                  <Box flex="1">
                    <Flex gap="3" justify="space-between">
                      <Text color="fg.muted" fontSize="xs">
                        {t('goals.targetDate')}
                      </Text>
                      <Text fontSize="xs" fontWeight="medium">
                        {formatGoalTargetDate(goal.targetDate, i18n.language)}
                      </Text>
                    </Flex>
                    <Text color="fg.muted" fontSize="xs" mt="1">
                      {t('goals.daysLeft', { count: remainingDays ?? 0 })}
                    </Text>
                  </Box>
                </Flex>
              ) : null}
              <Flex borderTopWidth="1px" gap="3" py="3">
                <Target aria-hidden="true" color="brand.fg" size={16} />
                <Box flex="1">
                  <Flex gap="3" justify="space-between">
                    <Text color="fg.muted" fontSize="xs">
                      {t('goals.progressMethod')}
                    </Text>
                    <Text fontSize="xs" fontWeight="medium">
                      {t(
                        `goals.modes.${goal.progressStrategy.mode === 'task-based' ? 'taskBased' : 'manual'}`,
                      )}
                    </Text>
                  </Flex>
                  <Text color="fg.muted" fontSize="xs" mt="1">
                    {t('goals.taskSummary', {
                      completed: completedTasks,
                      total: linkedTasks.length,
                    })}
                  </Text>
                </Box>
              </Flex>
              <Flex borderTopWidth="1px" gap="3" py="3">
                <Waves aria-hidden="true" color="success.fg" size={16} />
                <Box flex="1">
                  <Flex gap="3" justify="space-between">
                    <Text color="fg.muted" fontSize="xs">
                      {t('goals.currentPace')}
                    </Text>
                    <Text color="success.fg" fontSize="xs" fontWeight="medium">
                      {t('goals.onTrack')}
                    </Text>
                  </Flex>
                  <Text color="fg.muted" fontSize="xs" mt="1">
                    {t('goals.paceDetail')}
                  </Text>
                </Box>
              </Flex>
              <Flex borderTopWidth="1px" gap="3" py="3">
                <Timer aria-hidden="true" color="brand.fg" size={16} />
                <Box flex="1">
                  <Text color="fg.muted" fontSize="xs">
                    {t('goals.recommendedNextStep')}
                  </Text>
                  <Text fontSize="xs" fontWeight="medium" mt="1">
                    {linkedTasks.find((task) => task.status !== 'completed')
                      ?.title ?? t('goals.markComplete')}
                  </Text>
                </Box>
              </Flex>
            </Box>
            <Box
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              p="4"
              rounded="l2"
            >
              <Flex align="center" justify="space-between" mb="3">
                <HStack gap="2">
                  <Flag aria-hidden="true" color="brand.fg" size={18} />
                  <Text fontWeight="semibold">
                    {t('goals.milestones')} ({completedMilestones.length})
                  </Text>
                </HStack>
                {completedMilestones.length ? (
                  <Button
                    onClick={() => setIsMilestonesDrawerOpen(true)}
                    size="xs"
                    variant="ghost"
                  >
                    {t('goals.viewAll')}{' '}
                    <ChevronRight aria-hidden="true" size={14} />
                  </Button>
                ) : null}
              </Flex>
              <Stack gap="2">
                {completedMilestones.slice(0, 4).map((task) => (
                  <Button
                    _hover={{ bg: 'bg.subtle' }}
                    alignItems="start"
                    aria-label={t('tasks.editTask')}
                    gap="2"
                    h="auto"
                    justifyContent="start"
                    key={task.id}
                    minH="0"
                    minW="0"
                    onClick={() => openEditTask(task)}
                    p="2"
                    variant="ghost"
                    whiteSpace="normal"
                    w="full"
                  >
                    <Flex
                      align="center"
                      bg="brand.solid"
                      color="brand.contrast"
                      flexShrink="0"
                      fontSize="xs"
                      h="6"
                      justify="center"
                      rounded="full"
                      w="6"
                    >
                      <Check aria-hidden="true" size={13} />
                    </Flex>
                    <Box flex="1" minW="0" overflow="hidden" textAlign="start">
                      <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                        <PrivateText>{task.title}</PrivateText>
                      </Text>
                      <Text color="fg.muted" fontSize="xs" lineClamp={2}>
                        {task.description ?? t('goals.milestoneDetail')}
                      </Text>
                    </Box>
                    <ChevronRight
                      aria-hidden="true"
                      color="fg.muted"
                      size={16}
                    />
                  </Button>
                ))}
                {!completedMilestones.length ? (
                  <Text color="fg.muted" fontSize="sm">
                    {t('goals.noMilestones')}
                  </Text>
                ) : null}
              </Stack>
            </Box>
            <Box
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              p="4"
              rounded="l2"
            >
              <Flex align="center" justify="space-between" mb="3">
                <HStack gap="2">
                  <Waves aria-hidden="true" color="brand.fg" size={18} />
                  <Text fontWeight="semibold">{t('goals.recentActivity')}</Text>
                </HStack>
                {recentActivity.length ? (
                  <Button
                    onClick={() => setIsRecentActivityDrawerOpen(true)}
                    size="xs"
                    variant="ghost"
                  >
                    {t('goals.viewAll')}{' '}
                    <ChevronRight aria-hidden="true" size={14} />
                  </Button>
                ) : null}
              </Flex>
              {recentActivity.length ? (
                <Stack gap="2">
                  {recentActivity.slice(0, 4).map((activity) => {
                    const Icon = activity.type === 'focus' ? Clock3 : Timer
                    return (
                      <Flex
                        align="center"
                        borderTopWidth="1px"
                        gap="2"
                        key={activity.id}
                        pt="2"
                      >
                        <Icon aria-hidden="true" color="brand.fg" size={16} />
                        <Box flex="1" minW="0">
                          <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                            {t(
                              activity.type === 'focus'
                                ? 'goals.focusSession'
                                : 'goals.pomodoroSession',
                            )}
                          </Text>
                          <Text color="fg.muted" fontSize="xs">
                            {formatGoalFocusTime(activity.durationSeconds, t)}
                          </Text>
                        </Box>
                        <Text color="fg.muted" fontSize="xs">
                          {new Intl.DateTimeFormat(i18n.language, {
                            month: 'short',
                            day: 'numeric',
                          }).format(new Date(activity.endedAt))}
                        </Text>
                      </Flex>
                    )
                  })}
                </Stack>
              ) : (
                <Flex
                  align="center"
                  color="fg.muted"
                  direction="column"
                  gap="2"
                  minH="20"
                  justify="center"
                  textAlign="center"
                >
                  <FileText aria-hidden="true" size={25} />
                  <Text fontSize="sm">{t('goals.focusEmpty')}</Text>
                </Flex>
              )}
            </Box>
          </Stack>
        </Grid>
      </Stack>
      <GoalFormDialog
        goal={goal}
        isSubmitting={updateGoalMutation.isPending}
        onOpenChange={setIsFormOpen}
        onSubmit={saveGoal}
        open={isFormOpen}
      />
      <TaskImportDialog
        goal={goal}
        onOpenChange={setIsImportOpen}
        open={isImportOpen}
        tasks={linkedTasks}
      />
      <TaskFormDialog
        defaultGoalId={goalId}
        goals={[goal]}
        hideGoalField
        isSubmitting={
          createTaskMutation.isPending || updateTaskMutation.isPending
        }
        onOpenChange={closeTaskForm}
        onSubmit={saveTask}
        open={isTaskFormOpen}
        task={taskToEdit}
      />
      <GoalTasksDialog
        activeFocusSession={activeFocusSession}
        focusAvailable={focusAvailable}
        isMutating={updateTaskMutation.isPending}
        onEditTask={(task) => {
          setIsGoalTasksDialogOpen(false)
          openEditTask(task)
        }}
        onOpenChange={setIsGoalTasksDialogOpen}
        onStartFocus={startFocus}
        onToggleCompletion={(task) =>
          changeTaskStatus(task, task.status !== 'completed')
        }
        onUnlinkTask={setTaskToUnlink}
        open={isGoalTasksDialogOpen}
        tasks={linkedTasks}
      />
      <GoalPlanningDialog
        goalId={goalId}
        isSaving={createTimeBlockMutation.isPending}
        onConfirm={confirmGoalPlan}
        onOpenChange={setIsPlanningOpen}
        open={isPlanningOpen}
        plannerBlocks={plannerBlocksQuery.data ?? []}
        tasks={linkedTasks}
      />
      <MilestonesDrawer
        milestones={completedMilestones}
        onEditTask={openEditTask}
        onOpenChange={setIsMilestonesDrawerOpen}
        open={isMilestonesDrawerOpen}
      />
      <ConfirmDialog
        confirmLabel={t('goals.confirmUnlink')}
        description={t('goals.unlinkDescription', {
          task: taskToUnlink?.title ?? '',
        })}
        isConfirming={updateTaskMutation.isPending}
        isDestructive
        onConfirm={() => {
          if (taskToUnlink) linkTask(taskToUnlink.id, undefined)
        }}
        onOpenChange={(open) => {
          if (!open) setTaskToUnlink(undefined)
        }}
        open={Boolean(taskToUnlink)}
        title={t('goals.unlinkTitle')}
      />
      <GoalRecentActivityDrawer
        activities={recentActivity}
        onOpenChange={setIsRecentActivityDrawerOpen}
        open={isRecentActivityDrawerOpen}
      />
    </Container>
  )
}
