import {
  Box,
  Button,
  Container,
  Field,
  Flex,
  Grid,
  HStack,
  Input,
  NativeSelect,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListFilter,
  ListTodo,
  Plus,
  SlidersHorizontal,
  Target,
  TriangleAlert,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog/ConfirmDialog'
import { TasksPageSkeleton } from '@/features/tasks/components/TasksPageSkeleton'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { FilterPopover } from '@/components/shared/FilterPopover/FilterPopover'
import { toast } from '@/components/ui/Toaster/Toaster'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { TaskFormDialog } from '@/features/tasks/components/TaskFormDialog'
import { TaskList } from '@/features/tasks/components/TaskList'
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@/features/tasks/hooks/use-tasks'
import {
  applyTaskFilters,
  getLocalDate,
  getTasksForView,
  isTaskOverdue,
} from '@/features/tasks/services/task-view.service'
import type {
  Task,
  TaskFormSubmitInput,
  TaskPriority,
  TaskStatus,
  TaskView,
} from '@/features/tasks/types/tasks.types'
import {
  useStartFocusSession,
  useTodayDashboard,
} from '@/features/today/hooks/use-today-dashboard'

const views: TaskView[] = ['today', 'upcoming', 'all', 'completed']

function getWeekStart() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  date.setHours(0, 0, 0, 0)
  return date
}

function MetricCard({
  accent,
  detail,
  icon: Icon,
  label,
  value,
}: {
  accent: 'brand' | 'danger' | 'success' | 'warning'
  detail: string
  icon: typeof ListTodo
  label: string
  value: number
}) {
  const palette = {
    brand: { bg: 'brand.subtle', color: 'brand.fg' },
    danger: { bg: 'danger.subtle', color: 'danger.fg' },
    success: { bg: 'success.subtle', color: 'success.fg' },
    warning: { bg: 'warning.subtle', color: 'warning.fg' },
  } as const

  return (
    <Flex
      align="center"
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      gap="3"
      minH="20"
      p="3"
      rounded="l2"
      shadow="xs"
    >
      <Flex
        align="center"
        bg={palette[accent].bg}
        color={palette[accent].color}
        h="10"
        justify="center"
        rounded="full"
        w="10"
      >
        <Icon aria-hidden="true" size={20} />
      </Flex>
      <Stack gap="0">
        <Text color="fg.muted" fontSize="xs">
          {label}
        </Text>
        <HStack gap="1">
          <Text fontSize="xl" fontWeight="bold" lineHeight="1">
            {value}
          </Text>
          <Text color="fg.muted" fontSize="xs">
            {detail}
          </Text>
        </HStack>
      </Stack>
    </Flex>
  )
}

export function TasksPage() {
  const { t } = useTranslation()
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const tasksQuery = useTasks()
  const goalsQuery = useGoals({ status: 'active' }, isTaskFormOpen)
  const focusDashboardQuery = useTodayDashboard()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const startFocusMutation = useStartFocusSession()
  const [view, setView] = useState<TaskView>('today')
  const [status, setStatus] = useState<TaskStatus | undefined>()
  const [priority, setPriority] = useState<TaskPriority | undefined>()
  const [search, setSearch] = useState('')
  const [quickTitle, setQuickTitle] = useState('')
  const [taskToEdit, setTaskToEdit] = useState<Task>()
  const [taskToDelete, setTaskToDelete] = useState<Task>()

  const tasks = tasksQuery.data ?? []
  const visibleTasks = applyTaskFilters(getTasksForView(tasks, view), {
    priority,
    search,
    status,
  })
  const today = getLocalDate()
  const todayTasks = tasks.filter(
    (task) => task.dueDate === today && task.status !== 'cancelled',
  )
  const overdueTasks = tasks.filter((task) => isTaskOverdue(task, today))
  const upcomingTasks = tasks.filter(
    (task) =>
      task.status !== 'completed' &&
      task.status !== 'cancelled' &&
      Boolean(task.dueDate && task.dueDate > today),
  )
  const completedThisWeek = tasks.filter((task) => {
    if (task.status !== 'completed' || !task.completedAt) return false
    return new Date(task.completedAt) >= getWeekStart()
  })
  const focusReadyTasks = tasks
    .filter((task) => task.status === 'todo' || task.status === 'in_progress')
    .slice(0, 3)
  const completedToday = todayTasks.filter(
    (task) => task.status === 'completed',
  ).length
  const todayProgress = todayTasks.length
    ? Math.round((completedToday / todayTasks.length) * 100)
    : 0
  const priorityCounts = {
    high: tasks.filter((task) => task.priority === 'high').length,
    low: tasks.filter((task) => task.priority === 'low').length,
    medium: tasks.filter((task) => task.priority === 'medium').length,
  }
  const isMutating =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending ||
    deleteTaskMutation.isPending
  const focusAvailable = !focusDashboardQuery.data?.activeFocusSession

  function openCreateTask() {
    setTaskToEdit(undefined)
    setIsTaskFormOpen(true)
  }

  function closeTaskForm(open: boolean) {
    setIsTaskFormOpen(open)
    if (!open) setTaskToEdit(undefined)
  }

  function handleQuickCapture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = quickTitle.trim()
    if (!title) return

    createTaskMutation.mutate(
      { title },
      {
        onError: () => toast.error({ title: t('tasks.createError') }),
        onSuccess: () => {
          setQuickTitle('')
          toast.success({ title: t('tasks.created') })
        },
      },
    )
  }

  function handleFormSubmit(input: TaskFormSubmitInput) {
    if (taskToEdit) {
      updateTaskMutation.mutate(
        { ...input, taskId: taskToEdit.id },
        {
          onError: () => toast.error({ title: t('tasks.updateError') }),
          onSuccess: () => closeTaskForm(false),
        },
      )
      return
    }

    createTaskMutation.mutate(
      { ...input, goalId: input.goalId ?? undefined },
      {
        onError: () => toast.error({ title: t('tasks.createError') }),
        onSuccess: () => closeTaskForm(false),
      },
    )
  }

  function handleToggleCompletion(task: Task) {
    updateTaskMutation.mutate(
      {
        status: task.status === 'completed' ? 'todo' : 'completed',
        taskId: task.id,
        title: task.title,
      },
      { onError: () => toast.error({ title: t('tasks.updateError') }) },
    )
  }

  async function handleDeleteTask() {
    if (!taskToDelete) return

    await deleteTaskMutation.mutateAsync(taskToDelete.id, {
      onError: () => toast.error({ title: t('tasks.deleteError') }),
      onSuccess: () => setTaskToDelete(undefined),
    })
  }

  function handleStartFocus(task: Task) {
    startFocusMutation.mutate(
      { taskId: task.id },
      {
        onError: () => toast.warning({ title: t('tasks.focusUnavailable') }),
        onSuccess: () =>
          toast.success({
            title: t('tasks.focusStarted', { title: task.title }),
          }),
      },
    )
  }

  if (tasksQuery.isPending) return <TasksPageSkeleton />
  if (tasksQuery.isError) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState onRetry={() => void tasksQuery.refetch()} />
      </Container>
    )
  }

  return (
    <Container maxW="full" py={{ base: '4', md: '5' }}>
      <Stack gap={{ base: '4', md: '5' }}>
        <Flex
          align={{ base: 'start', md: 'end' }}
          justify="space-between"
          gap="4"
          wrap="wrap"
        >
          <Stack gap="1">
            <Text
              color="brand.fg"
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
            >
              {t('tasks.eyebrow')}
            </Text>
            <Text
              as="h1"
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="bold"
              lineHeight="1"
            >
              {t('tasks.title')}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {t('tasks.description')}
            </Text>
          </Stack>
          <Button colorPalette="brand" onClick={openCreateTask} size="sm">
            <Plus aria-hidden="true" size={17} />
            {t('tasks.createTask')}
          </Button>
        </Flex>

        <Grid
          alignItems="stretch"
          gap="3"
          templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 16rem' }}
        >
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3">
            <MetricCard
              accent="brand"
              detail={t('tasks.tasksCount')}
              icon={CalendarDays}
              label={t('tasks.todayMetric')}
              value={todayTasks.length}
            />
            <MetricCard
              accent="danger"
              detail={t('tasks.tasksCount')}
              icon={TriangleAlert}
              label={t('tasks.overdueMetric')}
              value={overdueTasks.length}
            />
            <MetricCard
              accent="warning"
              detail={t('tasks.tasksCount')}
              icon={Clock3}
              label={t('tasks.upcomingMetric')}
              value={upcomingTasks.length}
            />
            <MetricCard
              accent="success"
              detail={t('tasks.tasksCount')}
              icon={CheckCircle2}
              label={t('tasks.completedWeekMetric')}
              value={completedThisWeek.length}
            />
          </SimpleGrid>
          <Box
            bg="bg.panel"
            borderColor="border.subtle"
            borderWidth="1px"
            p="3"
            rounded="l2"
            shadow="xs"
          >
            <Text fontSize="sm" fontWeight="semibold">
              {t('tasks.todaysProgress')}
            </Text>
            <Flex align="center" gap="3" mt="3">
              <Flex
                align="center"
                colorPalette="brand"
                css={{
                  background: `conic-gradient(var(--chakra-colors-color-palette-solid) ${todayProgress}%, var(--chakra-colors-bg-subtle) 0)`,
                }}
                h="16"
                justify="center"
                p="2"
                rounded="full"
                w="16"
              >
                <Flex
                  align="center"
                  bg="bg.panel"
                  h="full"
                  justify="center"
                  rounded="full"
                  w="full"
                >
                  <Text fontSize="sm" fontWeight="bold">
                    {completedToday}/{todayTasks.length}
                  </Text>
                </Flex>
              </Flex>
              <Stack gap="1">
                <Text fontSize="sm" fontWeight="bold">
                  {todayProgress}% {t('tasks.completedLabel')}
                </Text>
                <Progress.Root
                  colorPalette="brand"
                  max={100}
                  size="xs"
                  value={todayProgress}
                  w="20"
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Stack>
            </Flex>
          </Box>
        </Grid>

        <Grid
          alignItems="start"
          gap="3"
          templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 16rem' }}
        >
          <Stack gap="3" minW="0">
            <Box
              bg="bg.elevated"
              borderColor="border.subtle"
              borderWidth="1px"
              p="3"
              rounded="l2"
              shadow="sm"
            >
              <form onSubmit={handleQuickCapture}>
                <Flex
                  align={{ base: 'stretch', md: 'center' }}
                  direction={{ base: 'column', md: 'row' }}
                  gap="2"
                >
                  <Flex
                    align="center"
                    bg="brand.subtle"
                    color="brand.fg"
                    h="9"
                    justify="center"
                    rounded="full"
                    w="9"
                  >
                    <Plus aria-hidden="true" size={18} />
                  </Flex>
                  <Input
                    aria-label={t('tasks.quickCaptureLabel')}
                    borderWidth="0"
                    flex="1"
                    onChange={(event) => setQuickTitle(event.target.value)}
                    placeholder={t('tasks.quickCapturePlaceholder')}
                    value={quickTitle}
                  />
                  <Button
                    colorPalette="brand"
                    disabled={!quickTitle.trim()}
                    loading={createTaskMutation.isPending}
                    type="submit"
                  >
                    {t('tasks.add')}
                  </Button>
                </Flex>
                <HStack gap="1" mt="3" overflowX="auto">
                  <Button onClick={openCreateTask} size="xs" variant="subtle">
                    <CalendarDays aria-hidden="true" size={14} />
                    {t('tasks.dueDateLabel')}
                  </Button>
                  <Button onClick={openCreateTask} size="xs" variant="subtle">
                    <Clock3 aria-hidden="true" size={14} />
                    {t('tasks.estimatedDurationLabel')}
                  </Button>
                  <Button onClick={openCreateTask} size="xs" variant="subtle">
                    <SlidersHorizontal aria-hidden="true" size={14} />
                    {t('tasks.priorityLabel')}
                  </Button>
                  <Button onClick={openCreateTask} size="xs" variant="subtle">
                    <Target aria-hidden="true" size={14} />
                    {t('tasks.goalLabel')}
                  </Button>
                </HStack>
              </form>
            </Box>

            <Flex
              align={{ base: 'stretch', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              gap="3"
              justify="space-between"
            >
              <HStack gap="1" overflowX="auto" pb="1">
                {views.map((item) => (
                  <Button
                    colorPalette={view === item ? 'brand' : undefined}
                    key={item}
                    onClick={() => setView(item)}
                    size="sm"
                    variant={view === item ? 'subtle' : 'ghost'}
                  >
                    {t(`tasks.views.${item}`)}
                  </Button>
                ))}
              </HStack>
              <HStack gap="2">
                <Box minW={{ base: '0', md: '15rem' }}>
                  <Input
                    aria-label={t('tasks.searchLabel')}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t('tasks.searchPlaceholder')}
                    value={search}
                  />
                </Box>
                <FilterPopover
                  clearLabel={t('tasks.clearFilters')}
                  onClear={() => {
                    setPriority(undefined)
                    setStatus(undefined)
                  }}
                  title={t('tasks.filtersTitle')}
                  trigger={
                    <Button
                      aria-label={t('tasks.filtersTitle')}
                      size="sm"
                      variant="outline"
                    >
                      <ListFilter aria-hidden="true" size={16} />
                      <Text display={{ base: 'none', sm: 'block' }}>
                        {t('tasks.filtersTitle')}
                      </Text>
                    </Button>
                  }
                >
                  <Field.Root>
                    <Field.Label>{t('tasks.statusLabel')}</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        onChange={(event) =>
                          setStatus(
                            (event.target.value || undefined) as
                              | TaskStatus
                              | undefined,
                          )
                        }
                        value={status ?? ''}
                      >
                        <option value="">{t('tasks.anyStatus')}</option>
                        <option value="todo">{t('tasks.status.todo')}</option>
                        <option value="in_progress">
                          {t('tasks.status.in_progress')}
                        </option>
                        <option value="completed">
                          {t('tasks.status.completed')}
                        </option>
                        <option value="cancelled">
                          {t('tasks.status.cancelled')}
                        </option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t('tasks.priorityLabel')}</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        onChange={(event) =>
                          setPriority(
                            (event.target.value || undefined) as
                              | TaskPriority
                              | undefined,
                          )
                        }
                        value={priority ?? ''}
                      >
                        <option value="">{t('tasks.anyPriority')}</option>
                        <option value="low">{t('tasks.priority.low')}</option>
                        <option value="medium">
                          {t('tasks.priority.medium')}
                        </option>
                        <option value="high">{t('tasks.priority.high')}</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </FilterPopover>
              </HStack>
            </Flex>

            <TaskList
              focusAvailable={focusAvailable}
              isMutating={isMutating}
              onDelete={setTaskToDelete}
              onEdit={(task) => {
                setTaskToEdit(task)
                setIsTaskFormOpen(true)
              }}
              onStartFocus={handleStartFocus}
              onToggleCompletion={handleToggleCompletion}
              tasks={visibleTasks}
            />
          </Stack>

          <Stack gap="3">
            <Box
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              p="3"
              rounded="l2"
              shadow="xs"
            >
              <Flex align="center" justify="space-between" mb="3">
                <HStack gap="2">
                  <Target aria-hidden="true" color="brand.fg" size={18} />
                  <Text fontSize="sm" fontWeight="semibold">
                    {t('tasks.focusReady')}
                  </Text>
                </HStack>
                <Text
                  bg="brand.subtle"
                  color="brand.fg"
                  fontSize="xs"
                  px="2"
                  py="1"
                  rounded="full"
                >
                  {focusReadyTasks.length}
                </Text>
              </Flex>
              <Text color="fg.muted" fontSize="xs" mb="3">
                {t('tasks.focusReadyDescription')}
              </Text>
              <Stack gap="2">
                {focusReadyTasks.map((task) => (
                  <Flex
                    align="center"
                    bg="bg.elevated"
                    borderColor="border.subtle"
                    borderWidth="1px"
                    gap="2"
                    key={task.id}
                    p="2"
                    rounded="l1"
                  >
                    <Box flex="1" minW="0">
                      <Text fontSize="xs" fontWeight="medium" lineClamp={1}>
                        {task.title}
                      </Text>
                      <Text color="fg.muted" fontSize="2xs">
                        {task.estimatedMinutes
                          ? t('tasks.duration', {
                              minutes: task.estimatedMinutes,
                            })
                          : t(`tasks.priority.${task.priority}`)}
                      </Text>
                    </Box>
                    <Button
                      aria-label={t('tasks.startFocus')}
                      disabled={!focusAvailable}
                      onClick={() => handleStartFocus(task)}
                      size="xs"
                    >
                      <ListTodo aria-hidden="true" size={13} />
                    </Button>
                  </Flex>
                ))}
                {!focusReadyTasks.length ? (
                  <Text color="fg.muted" fontSize="xs">
                    {t('tasks.emptyTitle')}
                  </Text>
                ) : null}
              </Stack>
            </Box>
            <Box
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              p="3"
              rounded="l2"
              shadow="xs"
            >
              <Text fontSize="sm" fontWeight="semibold">
                {t('tasks.taskDistribution')}
              </Text>
              <Stack gap="3" mt="4">
                {(['high', 'medium', 'low'] as const).map((item) => (
                  <Stack gap="1" key={item}>
                    <Flex justify="space-between">
                      <Text color="fg.muted" fontSize="xs">
                        {t(`tasks.priority.${item}`)}
                      </Text>
                      <Text fontSize="xs" fontWeight="bold">
                        {priorityCounts[item]}
                      </Text>
                    </Flex>
                    <Progress.Root
                      colorPalette={
                        item === 'high'
                          ? 'red'
                          : item === 'medium'
                            ? 'yellow'
                            : 'green'
                      }
                      max={Math.max(tasks.length, 1)}
                      size="xs"
                      value={priorityCounts[item]}
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Stack>
      <TaskFormDialog
        goals={goalsQuery.data ?? []}
        isSubmitting={isMutating}
        onOpenChange={closeTaskForm}
        onSubmit={handleFormSubmit}
        open={isTaskFormOpen}
        task={taskToEdit}
      />
      <ConfirmDialog
        confirmLabel={t('tasks.deleteTask')}
        description={t('tasks.deleteDescription', {
          title: taskToDelete?.title ?? '',
        })}
        isConfirming={deleteTaskMutation.isPending}
        isDestructive
        onConfirm={handleDeleteTask}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(undefined)
        }}
        open={Boolean(taskToDelete)}
        title={t('tasks.deleteTitle')}
      />
    </Container>
  )
}
