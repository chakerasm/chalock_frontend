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
  FileUp,
  FileText,
  ExternalLink,
  Flag,
  Lightbulb,
  ListChecks,
  Pencil,
  Plus,
  Target,
  Trophy,
  Timer,
  Unlink,
  Waves,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { toast } from '@/components/ui/Toaster/Toaster'
import { getFocusTimerSnapshot } from '@/features/focus/services/focus-timer.service'
import { GoalDetailSkeleton } from '@/features/goals/components/GoalDetailSkeleton'
import { GoalFormDialog } from '@/features/goals/components/GoalFormDialog'
import { TaskImportDialog } from '@/features/goals/components/TaskImportDialog'
import {
  useArchiveGoal,
  useGoal,
  useUpdateGoal,
} from '@/features/goals/hooks/use-goals'
import {
  getGoalFocusSummary,
  getGoalProgressSummary,
} from '@/features/goals/services/goal-progress.service'
import type {
  CreateGoalInput,
  GoalStatus,
} from '@/features/goals/types/goals.types'
import {
  useCreateTask,
  useTasks,
  useUpdateTask,
} from '@/features/tasks/hooks/use-tasks'
import type { Task } from '@/features/tasks/types/tasks.types'

function formatTargetDate(date: string, locale: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day, 12))
}

function formatFocusTime(
  seconds: number,
  t: ReturnType<typeof useTranslation>['t'],
) {
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours) return t('goals.focusDuration', { hours, minutes })
  return t('goals.focusMinutes', { minutes })
}

type GoalDetailPageProps = { goalId: string }

type SummaryMetricProps = {
  icon: typeof ListChecks
  label: string
  value: string | number
}

function SummaryMetric({ icon: Icon, label, value }: SummaryMetricProps) {
  return (
    <Flex
      align="center"
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      gap="3"
      minW="0"
      p="3"
      rounded="l2"
      shadow="xs"
    >
      <Flex
        align="center"
        bg="brand.subtle"
        color="brand.fg"
        h="9"
        justify="center"
        rounded="l1"
        w="9"
      >
        <Icon aria-hidden="true" size={18} />
      </Flex>
      <Box minW="0">
        <Text fontSize="md" fontWeight="bold" lineHeight="1.1">
          {value}
        </Text>
        <Text color="fg.muted" fontSize="xs" lineClamp={1} mt="1">
          {label}
        </Text>
      </Box>
      <ChevronRight
        aria-hidden="true"
        color="var(--chakra-colors-fg-muted)"
        size={16}
      />
    </Flex>
  )
}

export function GoalDetailPage({ goalId }: GoalDetailPageProps) {
  const { i18n, t } = useTranslation()
  const goalQuery = useGoal(goalId)
  const linkedTasksQuery = useTasks({ goalId })
  const allTasksQuery = useTasks()
  const updateGoalMutation = useUpdateGoal()
  const archiveGoalMutation = useArchiveGoal()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const focusSnapshot = useState(() => getFocusTimerSnapshot())[0]
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [taskToLink, setTaskToLink] = useState('')
  const [manualProgress, setManualProgress] = useState(0)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const goal = goalQuery.data

  useEffect(() => {
    if (goal?.progressStrategy.mode === 'manual') {
      setManualProgress(goal.progress)
    }
  }, [goal?.progress, goal?.progressStrategy.mode])

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
  const isCompleted = goal.status === 'completed'
  const completedTasks = linkedTasks.filter(
    (task) => task.status === 'completed',
  ).length
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

  function setStatus(status: GoalStatus) {
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

  function saveGoal(input: CreateGoalInput) {
    updateGoalMutation.mutate(
      { ...input, goalId },
      {
        onError: () => toast.error({ title: t('goals.updateError') }),
        onSuccess: () => setIsFormOpen(false),
      },
    )
  }

  function saveManualProgress(event: FormEvent<HTMLFormElement>) {
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

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = newTaskTitle.trim()
    if (!title) return
    createTaskMutation.mutate(
      { title, goalId },
      {
        onError: () => toast.error({ title: t('goals.taskUpdateError') }),
        onSuccess: () => setNewTaskTitle(''),
      },
    )
  }

  function changeTaskStatus(task: Task, completed: boolean) {
    updateTaskMutation.mutate(
      {
        taskId: task.id,
        status: completed ? 'completed' : 'todo',
        title: task.title,
      },
      { onError: () => toast.error({ title: t('goals.taskUpdateError') }) },
    )
  }

  function linkTask(taskId: string, selectedGoalId: string | undefined) {
    const task = allTasks.find((item) => item.id === taskId)
    if (!task) return
    updateTaskMutation.mutate(
      { taskId, goalId: selectedGoalId ?? null, title: task.title },
      {
        onError: () => toast.error({ title: t('goals.taskUpdateError') }),
        onSuccess: () => setTaskToLink(''),
      },
    )
  }

  return (
    <Container maxW="full" px={{ base: '3', md: '4' }} py="3">
      <Stack gap="3">
        <Box
          bgGradient="linear(120deg, bg.panel, brand.subtle, bg.panel)"
          borderColor="brand.border"
          borderWidth="1px"
          p={{ base: '4', md: '5' }}
          rounded="l3"
          shadow="md"
        >
          <Flex
            align={{ base: 'start', lg: 'center' }}
            direction={{ base: 'column', lg: 'row' }}
            gap="5"
            justify="space-between"
          >
            <HStack align="center" gap="4">
              <Flex
                align="center"
                bg="brand.muted"
                borderColor="brand.border"
                borderWidth="1px"
                color="brand.fg"
                h={{ base: '16', md: '20' }}
                justify="center"
                rounded="l2"
                w={{ base: '16', md: '20' }}
              >
                <Trophy aria-hidden="true" size={34} />
              </Flex>
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
                    {t(`goals.status.${goal.status}`)}
                  </Text>
                </HStack>
                <Text
                  fontSize={{ base: '2xl', md: '3xl' }}
                  fontWeight="bold"
                  letterSpacing="tight"
                >
                  {goal.title}
                </Text>
                {goal.description ? (
                  <Text color="fg.muted" mt="1">
                    {goal.description}
                  </Text>
                ) : null}
              </Box>
            </HStack>
            <HStack flexWrap="wrap" gap="2">
              {!isCompleted && goal.status !== 'archived' ? (
                <Button
                  colorPalette="brand"
                  disabled={updateGoalMutation.isPending}
                  onClick={() => setStatus('completed')}
                  size="sm"
                >
                  <Check aria-hidden="true" size={16} />
                  {t('goals.markComplete')}
                </Button>
              ) : null}
              {goal.status === 'active' ? (
                <Button
                  onClick={() => setStatus('paused')}
                  size="sm"
                  variant="outline"
                >
                  {t('goals.pause')}
                </Button>
              ) : goal.status === 'paused' ? (
                <Button
                  onClick={() => setStatus('active')}
                  size="sm"
                  variant="outline"
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
                  variant="ghost"
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
              <SummaryMetric
                icon={ListChecks}
                label={t('goals.remainingTasks')}
                value={remainingTasks}
              />
              <SummaryMetric
                icon={CalendarDays}
                label={t('goals.daysRemaining')}
                value={remainingDays ?? '—'}
              />
              <SummaryMetric
                icon={Timer}
                label={t('goals.focusTitle')}
                value={focus.sessionCount}
              />
              <SummaryMetric
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
                      {formatTargetDate(goal.targetDate, i18n.language)}
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
                </Box>
                <Button
                  onClick={() => setIsImportOpen(true)}
                  size="sm"
                  variant="outline"
                >
                  <FileUp aria-hidden="true" size={16} />
                  Import tasks
                </Button>
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
                      <Checkbox.Control />
                      <Checkbox.Label>{task.title}</Checkbox.Label>
                    </Checkbox.Root>
                    <Badge
                      colorPalette={
                        task.priority === 'high'
                          ? 'red'
                          : task.priority === 'medium'
                            ? 'yellow'
                            : 'blue'
                      }
                      display={{ base: 'none', md: 'inline-flex' }}
                      size="sm"
                      variant="subtle"
                    >
                      {t(`tasks.priority.${task.priority}`)}
                    </Badge>
                    {task.dueDate ? (
                      <HStack
                        color="fg.muted"
                        display={{ base: 'none', lg: 'flex' }}
                        fontSize="xs"
                        gap="1"
                      >
                        <CalendarDays aria-hidden="true" size={13} />
                        <Text>
                          {formatTargetDate(task.dueDate, i18n.language)}
                        </Text>
                      </HStack>
                    ) : null}
                    {task.estimatedMinutes ? (
                      <HStack
                        color="fg.muted"
                        display={{ base: 'none', lg: 'flex' }}
                        fontSize="xs"
                        gap="1"
                      >
                        <Clock3 aria-hidden="true" size={13} />
                        <Text>
                          {task.estimatedMinutes >= 60
                            ? `${Math.round(task.estimatedMinutes / 60)}h`
                            : `${task.estimatedMinutes} min`}
                        </Text>
                      </HStack>
                    ) : null}
                    <ExternalLink
                      aria-hidden="true"
                      color="fg.muted"
                      size={15}
                    />
                    <IconButton
                      aria-label={t('goals.unlinkTask', { task: task.title })}
                      disabled={updateTaskMutation.isPending}
                      ml="auto"
                      onClick={() => linkTask(task.id, undefined)}
                      size="xs"
                      title={t('goals.unlinkTask', { task: task.title })}
                      variant="ghost"
                    >
                      <Unlink aria-hidden="true" size={15} />
                    </IconButton>
                  </Flex>
                ))}
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
              <form onSubmit={handleAddTask}>
                <HStack borderTopWidth="1px" gap="2" pt="3">
                  <Input
                    aria-label={t('goals.newTaskTitle')}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    placeholder={t('goals.newTaskPlaceholder')}
                    value={newTaskTitle}
                  />
                  <Button
                    disabled={
                      !newTaskTitle.trim() || createTaskMutation.isPending
                    }
                    size="sm"
                    type="submit"
                    variant="outline"
                  >
                    <Plus aria-hidden="true" size={16} />
                    {t('goals.addTask')}
                  </Button>
                </HStack>
              </form>
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
                      duration: formatFocusTime(focus.totalSeconds, t),
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
                        {formatTargetDate(goal.targetDate, i18n.language)}
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
                    {t('goals.milestones')} (
                    {Math.min(4, Math.max(1, linkedTasks.length))})
                  </Text>
                </HStack>
                <Button size="xs" variant="ghost">
                  {t('goals.viewAll')}{' '}
                  <ChevronRight aria-hidden="true" size={14} />
                </Button>
              </Flex>
              <Stack gap="2">
                {linkedTasks.slice(0, 4).map((task, index) => (
                  <Flex gap="3" key={task.id}>
                    <Flex
                      align="center"
                      bg={
                        task.status === 'completed'
                          ? 'brand.solid'
                          : 'bg.subtle'
                      }
                      color={
                        task.status === 'completed'
                          ? 'brand.contrast'
                          : 'fg.muted'
                      }
                      flexShrink="0"
                      fontSize="xs"
                      h="6"
                      justify="center"
                      rounded="full"
                      w="6"
                    >
                      {task.status === 'completed' ? (
                        <Check aria-hidden="true" size={13} />
                      ) : (
                        index + 1
                      )}
                    </Flex>
                    <Box minW="0">
                      <Text fontSize="sm" fontWeight="medium">
                        {task.title}
                      </Text>
                      <Text color="fg.muted" fontSize="xs">
                        {task.description ?? t('goals.milestoneDetail')}
                      </Text>
                    </Box>
                  </Flex>
                ))}
                {!linkedTasks.length ? (
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
                <Button size="xs" variant="ghost">
                  {t('goals.viewAll')}{' '}
                  <ChevronRight aria-hidden="true" size={14} />
                </Button>
              </Flex>
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
                <Text fontSize="sm">
                  {focus.sessionCount
                    ? t('goals.focusSummary', {
                        duration: formatFocusTime(focus.totalSeconds, t),
                        sessions: focus.sessionCount,
                      })
                    : t('goals.focusEmpty')}
                </Text>
              </Flex>
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
    </Container>
  )
}
