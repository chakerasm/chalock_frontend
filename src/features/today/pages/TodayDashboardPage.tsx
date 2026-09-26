import {
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { Play, Plus, StickyNote } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { ActiveFocusSessionDialog } from '@/features/today/components/ActiveFocusSessionDialog'
import { ActiveGoalsCard } from '@/features/today/components/ActiveGoalsCard'
import { AddTaskDialog } from '@/features/today/components/AddTaskDialog'
import {
  FocusCard,
  getFocusElapsedSeconds,
} from '@/features/today/components/FocusCard'
import { QuickNoteCard } from '@/features/today/components/QuickNoteCard'
import { TodayHabitsCard } from '@/features/today/components/TodayHabitsCard'
import { TodayTasksCard } from '@/features/today/components/TodayTasksCard'
import {
  useCreateQuickNote,
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

export function TodayDashboardPage() {
  const { i18n, t } = useTranslation()
  const dashboardQuery = useTodayDashboard()
  const createTask = useCreateTodayTask()
  const updateTask = useUpdateTodayTask()
  const updateHabit = useUpdateHabitCheckIn()
  const startFocus = useStartFocusSession()
  const updateFocus = useUpdateFocusSession()
  const createNote = useCreateQuickNote()
  const quickNoteRef = useRef<HTMLTextAreaElement>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isFocusDialogOpen, setIsFocusDialogOpen] = useState(false)
  const dashboard = dashboardQuery.data

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
    status: 'paused' | 'running',
  ) {
    updateFocus.mutate(
      { elapsedSeconds, sessionId: session.id, status },
      { onError: () => toast.error({ title: t('today.focusUpdateError') }) },
    )
  }

  if (dashboardQuery.isPending) return null
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
    <Container maxW="7xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '5', md: '7' }}>
        <PageHeader
          actions={
            <Stack display={{ base: 'none', md: 'flex' }}>{quickActions}</Stack>
          }
          description={t('today.overview', {
            habits: remainingHabits,
            tasks: remainingTasks,
          })}
          eyebrow={formatTodayDate(dashboard.date, i18n.language)}
          title={t(greetingKey(new Date().getHours()), { name: 'Alex' })}
        />
        <Grid
          alignItems="start"
          gap={{ base: '4', md: '5' }}
          templateColumns={{
            base: '1fr',
            xl: 'minmax(0, 1.45fr) minmax(20rem, 0.9fr)',
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
            colStart={{ base: 'auto', xl: 1 }}
            order={{ base: 3, xl: 3 }}
          >
            <TodayHabitsCard
              habits={dashboard.scheduledHabits}
              isUpdating={updateHabit.isPending}
              onUpdateHabit={(habitId, action) =>
                updateHabit.mutate(
                  { action, habitId },
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
            colStart={{ base: 'auto', xl: 2 }}
            order={{ base: 4, xl: 4 }}
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
