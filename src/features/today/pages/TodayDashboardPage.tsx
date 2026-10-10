import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListTodo,
  Play,
  Plus,
  StickyNote,
} from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { toast } from '@/components/ui/Toaster/Toaster'
import { useCreateNote } from '@/features/notes/hooks/use-notes'
import { useAllTimeBlocks } from '@/features/planner/hooks/use-planner'
import { CarryOverReviewCard } from '@/features/tasks/components/CarryOverReviewCard'
import { useTasks, useUpdateTask } from '@/features/tasks/hooks/use-tasks'
import { getPreviousLocalDate } from '@/features/tasks/services/task-reschedule.service'
import type { Task } from '@/features/tasks/types/tasks.types'
import { ActiveFocusSessionDialog } from '@/features/today/components/ActiveFocusSessionDialog'
import { ActiveGoalsCard } from '@/features/today/components/ActiveGoalsCard'
import { AddTaskDialog } from '@/features/today/components/AddTaskDialog'
import {
  FocusCard,
  getFocusElapsedSeconds,
} from '@/features/today/components/FocusCard'
import { QuickNoteCard } from '@/features/today/components/QuickNoteCard'
import { TodayDashboardSkeleton } from '@/features/today/components/TodayDashboardSkeleton'
import { TodayHabitsCard } from '@/features/today/components/TodayHabitsCard'
import { TodayTasksCard } from '@/features/today/components/TodayTasksCard'
import {
  useCreateTodayTask,
  useStartFocusSession,
  useTodayDashboard,
  useUpdateFocusSession,
  useUpdateHabitCheckIn,
  useUpdateTodayTask,
} from '@/features/today/hooks/use-today-dashboard'
import type {
  ActiveFocusSession,
  CreateTodayTaskInput,
} from '@/features/today/types/today.types'

function greetingKey(hour: number) {
  if (hour < 12) return 'today.greetingMorning'
  if (hour < 18) return 'today.greetingAfternoon'
  return 'today.greetingEvening'
}

function formatTodayDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

function DashboardMetric({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string
  icon: typeof ListTodo
  label: string
  value: string | number
}) {
  return (
    <FlexMetric>
      <Box
        alignItems="center"
        bg="brand.subtle"
        color="brand.fg"
        display="flex"
        h="10"
        justifyContent="center"
        rounded="l2"
        w="10"
      >
        <Icon aria-hidden="true" size={20} />
      </Box>
      <Stack gap="0" minW="0">
        <Text fontSize="lg" fontWeight="bold" lineHeight="1.1">
          {value}
        </Text>
        <Text color="fg.muted" fontSize="xs">
          {label}
        </Text>
        <Text color="fg.subtle" fontSize="2xs">
          {detail}
        </Text>
      </Stack>
    </FlexMetric>
  )
}

function FlexMetric({ children }: { children: ReactNode }) {
  return (
    <HStack
      bg="bg.elevated"
      borderColor="border.subtle"
      borderWidth="1px"
      gap="3"
      minH="20"
      p="3"
      rounded="l2"
      shadow="xs"
    >
      {children}
    </HStack>
  )
}

export function TodayDashboardPage() {
  const { i18n, t } = useTranslation()
  const dashboardQuery = useTodayDashboard()
  const createTask = useCreateTodayTask()
  const updateTask = useUpdateTodayTask()
  const updateCarriedTask = useUpdateTask()
  const allTasksQuery = useTasks()
  const updateHabit = useUpdateHabitCheckIn()
  const startFocus = useStartFocusSession()
  const updateFocus = useUpdateFocusSession()
  const createNote = useCreateNote()
  const quickNoteRef = useRef<HTMLTextAreaElement>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isFocusDialogOpen, setIsFocusDialogOpen] = useState(false)
  const dashboard = dashboardQuery.data
  const yesterday = getPreviousLocalDate()
  const yesterdayPlannerBlocks = useAllTimeBlocks(yesterday, yesterday)
  const [isCarryOverDismissed, setIsCarryOverDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.sessionStorage.getItem('carry-over-review-date') ===
      getPreviousLocalDate()
    )
  })

  const carryOverTasks = (allTasksQuery.data ?? []).filter(
    (task) =>
      task.dueDate === yesterday &&
      task.status !== 'completed' &&
      task.status !== 'cancelled',
  )

  function skipCarryOverReview() {
    window.sessionStorage.setItem('carry-over-review-date', yesterday)
    setIsCarryOverDismissed(true)
  }

  function updateCarriedTasks(tasks: Task[], dueDate: string | null) {
    void Promise.all(
      tasks.map((task) =>
        updateCarriedTask.mutateAsync({
          dueDate,
          occurrenceDate: task.occurrenceDate,
          scope: task.seriesId ? 'this' : undefined,
          taskId: task.id,
          title: task.title,
        }),
      ),
    ).catch(() => toast.error({ title: t('tasks.updateError') }))
  }

  function completeCarriedTasks(tasks: Task[]) {
    void Promise.all(
      tasks.map((task) =>
        updateCarriedTask.mutateAsync({
          occurrenceDate: task.occurrenceDate,
          scope: task.seriesId ? 'this' : undefined,
          status: 'completed',
          taskId: task.id,
          title: task.title,
        }),
      ),
    ).catch(() => toast.error({ title: t('tasks.updateError') }))
  }

  function handleCreateTask(input: CreateTodayTaskInput) {
    createTask.mutate(input, {
      onError: () => toast.error({ title: t('today.taskCreateError') }),
      onSuccess: () => {
        setIsAddTaskOpen(false)
        toast.success({ title: t('today.taskCreated') })
      },
    })
  }

  function handleStartFocus() {
    startFocus.mutate(
      {},
      {
        onError: () => toast.error({ title: t('today.focusStartError') }),
      },
    )
  }

  function handleUpdateFocus(
    session: ActiveFocusSession,
    elapsedSeconds: number,
    status: 'active' | 'paused',
  ) {
    updateFocus.mutate(
      { elapsedSeconds, sessionId: session.id, status },
      { onError: () => toast.error({ title: t('today.focusUpdateError') }) },
    )
  }

  if (dashboardQuery.isPending) return <TodayDashboardSkeleton />
  if (dashboardQuery.isError || !dashboard) {
    return (
      <Container maxW="7xl" py={{ base: '8', md: '12' }}>
        <ErrorState onRetry={() => void dashboardQuery.refetch()} />
      </Container>
    )
  }

  const remainingTasks = dashboard.tasks.filter(
    (task) => task.status !== 'completed',
  ).length
  const remainingHabits = dashboard.scheduledHabits.filter(
    (habit) => !habit.completed,
  ).length
  const completedHabits = dashboard.scheduledHabits.length - remainingHabits
  const focusMinutes = dashboard.focusSummary.completedMinutes
  const quickActions = (
    <HStack gap="2" wrap="wrap">
      <Button
        colorPalette="brand"
        onClick={() => setIsAddTaskOpen(true)}
        size="sm"
      >
        <Plus aria-hidden="true" size={16} />
        {t('today.addTask')}
      </Button>
      <Button
        disabled={Boolean(dashboard.activeFocusSession)}
        onClick={handleStartFocus}
        size="sm"
        variant="outline"
      >
        <Play aria-hidden="true" size={15} />
        {t('today.startFocus')}
      </Button>
      <Button
        onClick={() => quickNoteRef.current?.focus()}
        size="sm"
        variant="ghost"
      >
        <StickyNote aria-hidden="true" size={16} />
        {t('today.addQuickNote')}
      </Button>
    </HStack>
  )

  return (
    <Container maxW="7xl" py={{ base: '5', md: '7' }}>
      <Stack gap={{ base: '4', md: '5' }}>
        <Flex
          align={{ base: 'start', md: 'end' }}
          direction={{ base: 'column', md: 'row' }}
          gap="4"
          justify="space-between"
        >
          <Stack gap="1">
            <Text
              color="brand.fg"
              fontSize="xs"
              fontWeight="semibold"
              textTransform="capitalize"
            >
              {formatTodayDate(dashboard.date, i18n.language)}
            </Text>
            <Text
              as="h1"
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="bold"
              letterSpacing="tight"
            >
              {t(greetingKey(new Date().getHours()), { name: 'Chaker' })}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {t('today.overview', {
                habits: remainingHabits,
                tasks: remainingTasks,
              })}
            </Text>
          </Stack>
          <Box display={{ base: 'none', md: 'block' }}>{quickActions}</Box>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
          <DashboardMetric
            detail={t('today.tasksSummary', { remaining: remainingTasks })}
            icon={ListTodo}
            label={t('today.tasksTitle')}
            value={remainingTasks}
          />
          <DashboardMetric
            detail={t('today.habitsSummary', {
              completed: completedHabits,
              total: dashboard.scheduledHabits.length,
            })}
            icon={CheckCircle2}
            label={t('today.habitsTitle')}
            value={`${completedHabits}/${dashboard.scheduledHabits.length}`}
          />
          <DashboardMetric
            detail={t('today.focusToday')}
            icon={Clock3}
            label={t('today.focusTitle')}
            value={t('today.focusMinutes', { minutes: focusMinutes })}
          />
          <DashboardMetric
            detail={formatTodayDate(dashboard.date, i18n.language)}
            icon={CalendarDays}
            label={t('today.eventsToday')}
            value="0"
          />
        </SimpleGrid>
        {!isCarryOverDismissed && carryOverTasks.length > 0 ? (
          <CarryOverReviewCard
            isUpdating={updateCarriedTask.isPending}
            onComplete={completeCarriedTasks}
            onReschedule={updateCarriedTasks}
            onSkip={skipCarryOverReview}
            plannerBlocks={yesterdayPlannerBlocks.data ?? []}
            tasks={carryOverTasks}
          />
        ) : null}
        <Grid
          alignItems="start"
          gap="3"
          templateColumns={{
            base: '1fr',
            xl: 'minmax(0, 1.5fr) minmax(18rem, 0.8fr) minmax(16rem, 0.6fr)',
          }}
        >
          <GridItem
            colStart={{ base: 'auto', xl: 1 }}
            order={{ base: 1, xl: 1 }}
          >
            <TodayTasksCard
              isUpdating={updateTask.isPending}
              onUpdateTask={(taskId, completed) =>
                updateTask.mutate(
                  { completed, taskId },
                  {
                    onError: () =>
                      toast.error({ title: t('today.taskUpdateError') }),
                  },
                )
              }
              tasks={dashboard.tasks}
            />
          </GridItem>
          <GridItem
            colStart={{ base: 'auto', xl: 2 }}
            order={{ base: 2, xl: 2 }}
          >
            <FocusCard
              activeSession={dashboard.activeFocusSession}
              focusSummary={dashboard.focusSummary}
              isUpdating={startFocus.isPending || updateFocus.isPending}
              onOpenSession={() => setIsFocusDialogOpen(true)}
              onStart={handleStartFocus}
              onUpdateSession={handleUpdateFocus}
            />
          </GridItem>
          <GridItem
            colStart={{ base: 'auto', xl: 3 }}
            order={{ base: 4, xl: 3 }}
          >
            <QuickNoteCard
              inputRef={quickNoteRef}
              isSaving={createNote.isPending}
              onSave={(content, onSuccess) =>
                createNote.mutate(
                  { content },
                  {
                    onError: () =>
                      toast.error({ title: t('today.noteCreateError') }),
                    onSuccess: () => {
                      onSuccess()
                      toast.success({ title: t('today.noteSaved') })
                    },
                  },
                )
              }
            />
          </GridItem>
          <GridItem
            colStart={{ base: 'auto', xl: 1 }}
            order={{ base: 3, xl: 4 }}
          >
            <TodayHabitsCard
              habits={dashboard.scheduledHabits}
              isUpdating={updateHabit.isPending}
              onUpdateHabit={(habit, action) =>
                updateHabit.mutate(
                  {
                    action,
                    currentDayCount: habit.currentDayCount,
                    currentCount: habit.currentCount,
                    habitId: habit.id,
                    isWeeklyTarget: habit.isWeeklyTarget,
                    targetCount: habit.targetCount,
                  },
                  {
                    onError: () =>
                      toast.error({ title: t('today.habitUpdateError') }),
                  },
                )
              }
            />
          </GridItem>
          <GridItem
            display={{ base: 'block', md: 'none' }}
            order={{ base: 4, xl: 4 }}
          >
            {quickActions}
          </GridItem>
          <GridItem
            colSpan={{ base: 1, xl: 2 }}
            colStart={{ base: 'auto', xl: 2 }}
            order={{ base: 5, xl: 5 }}
          >
            <ActiveGoalsCard goals={dashboard.activeGoals} />
          </GridItem>
        </Grid>
      </Stack>
      <AddTaskDialog
        isSubmitting={createTask.isPending}
        onCreateTask={handleCreateTask}
        onOpenChange={setIsAddTaskOpen}
        open={isAddTaskOpen}
      />
      <ActiveFocusSessionDialog
        elapsedSeconds={
          dashboard.activeFocusSession
            ? getFocusElapsedSeconds(dashboard.activeFocusSession)
            : 0
        }
        isUpdating={updateFocus.isPending}
        onOpenChange={setIsFocusDialogOpen}
        onUpdateSession={handleUpdateFocus}
        open={isFocusDialogOpen}
        session={dashboard.activeFocusSession}
      />
    </Container>
  )
}
