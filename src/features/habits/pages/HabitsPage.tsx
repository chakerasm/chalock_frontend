import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Flame,
  Lightbulb,
  Plus,
  Target,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { HabitsPageSkeleton } from '@/features/habits/components/HabitsPageSkeleton'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { HabitFormDialog } from '@/features/habits/components/HabitFormDialog'
import { HabitTodayList } from '@/features/habits/components/HabitTodayList'
import { HabitWeeklyView } from '@/features/habits/components/HabitWeeklyView'
import {
  useArchiveHabit,
  useCreateHabit,
  useHabitLogs,
  useHabits,
  useUpdateHabit,
  useWriteHabitLog,
} from '@/features/habits/hooks/use-habits'
import {
  addLocalDays,
  getHabitStreak,
  getLocalDate,
  getWeekStart,
  isHabitLogCompleted,
  isHabitScheduledOnDate,
} from '@/features/habits/services/habit-calendar.service'
import type {
  CreateHabitInput,
  Habit,
  HabitLog,
  HabitState,
} from '@/features/habits/types/habits.types'

type HabitView = 'today' | 'week'

function formatWeek(start: string, end: string, locale: string) {
  const [startYear, startMonth, startDay] = start.split('-').map(Number)
  const [endYear, endMonth, endDay] = end.split('-').map(Number)
  const startDate = new Date(startYear, startMonth - 1, startDay, 12)
  const endDate = new Date(endYear, endMonth - 1, endDay, 12)
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  })
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`
}

export function HabitsPage() {
  const { i18n, t } = useTranslation()
  const today = getLocalDate()
  const weekStart = getWeekStart(today)
  const weekDates = Array.from({ length: 7 }, (_, index) =>
    addLocalDays(weekStart, index),
  )
  const [view, setView] = useState<HabitView>('today')
  const [listState, setListState] = useState<HabitState>('active')
  const [editingHabit, setEditingHabit] = useState<Habit>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const habitsQuery = useHabits({ state: listState })
  const historyStart = (habitsQuery.data ?? []).reduce((earliest, habit) => {
    const createdDate = getLocalDate(new Date(habit.createdAt))
    return createdDate < earliest ? createdDate : earliest
  }, weekStart)
  const logsQuery = useHabitLogs(historyStart, weekDates[6])
  const createMutation = useCreateHabit()
  const updateMutation = useUpdateHabit()
  const archiveMutation = useArchiveHabit()
  const writeLogMutation = useWriteHabitLog()

  if (habitsQuery.isPending || logsQuery.isPending)
    return <HabitsPageSkeleton />
  if (habitsQuery.isError || logsQuery.isError) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState
          onRetry={() => {
            void habitsQuery.refetch()
            void logsQuery.refetch()
          }}
        />
      </Container>
    )
  }

  const habits = habitsQuery.data ?? []
  const logs = logsQuery.data ?? []
  const todayHabits = habits.filter((habit) => {
    if (!isHabitScheduledOnDate(habit, today)) return false
    if (habit.schedule.type !== 'weekly-target') return true
    const progress = logs
      .filter(
        (log) =>
          log.habitId === habit.id &&
          log.date >= weekStart &&
          log.date <= weekDates[6],
      )
      .reduce((total, log) => total + log.progress, 0)
    return progress < (habit.targetCount ?? 0)
  })
  const isUpdating =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending ||
    writeLogMutation.isPending

  const completedThisWeek = habits.reduce(
    (total, habit) =>
      total +
      weekDates.filter((date) => {
        const log = logs.find(
          (entry) => entry.habitId === habit.id && entry.date === date,
        )
        return Boolean(
          log && isHabitLogCompleted(habit, date, log.progress, logs),
        )
      }).length,
    0,
  )
  const scheduledThisWeek = habits.reduce(
    (total, habit) =>
      total +
      weekDates.filter((date) => isHabitScheduledOnDate(habit, date)).length,
    0,
  )
  const dashboardCompletedToday = todayHabits.filter((habit) => {
    const log = logs.find(
      (entry) => entry.habitId === habit.id && entry.date === today,
    )
    return Boolean(log && isHabitLogCompleted(habit, today, log.progress, logs))
  }).length

  function openCreate() {
    setEditingHabit(undefined)
    setIsFormOpen(true)
  }

  function saveHabit(input: CreateHabitInput) {
    if (editingHabit) {
      updateMutation.mutate(
        { ...input, habitId: editingHabit.id },
        {
          onError: () => toast.error({ title: t('habits.updateError') }),
          onSuccess: () => {
            setIsFormOpen(false)
            setEditingHabit(undefined)
            toast.success({ title: t('habits.updated') })
          },
        },
      )
      return
    }
    createMutation.mutate(input, {
      onError: () => toast.error({ title: t('habits.createError') }),
      onSuccess: () => {
        setIsFormOpen(false)
        toast.success({ title: t('habits.created') })
      },
    })
  }

  function archive(habit: Habit) {
    archiveMutation.mutate(habit.id, {
      onError: () => toast.error({ title: t('habits.archiveError') }),
      onSuccess: () => toast.success({ title: t('habits.archived') }),
    })
  }

  function setHabitState(habit: Habit, state: 'active' | 'paused') {
    updateMutation.mutate(
      { habitId: habit.id, state },
      {
        onError: () =>
          toast.error({
            title: t(
              state === 'paused' ? 'habits.pauseError' : 'habits.resumeError',
            ),
          }),
        onSuccess: () =>
          toast.success({
            title: t(state === 'paused' ? 'habits.paused' : 'habits.resumed'),
          }),
      },
    )
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
      { onError: () => toast.error({ title: t('habits.progressError') }) },
    )
  }

  const completedToday = todayHabits.filter((habit) => {
    const dayLog = logs.find(
      (log) => log.habitId === habit.id && log.date === today,
    )
    if (habit.schedule.type === 'weekly-target') {
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
      )
    }
    return Boolean(dayLog?.completed)
  }).length

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '5', md: '7' }}>
        <PageHeader
          actions={
            listState === 'active' ? (
              <Button colorPalette="brand" onClick={openCreate}>
                <Plus aria-hidden="true" size={18} />
                {t('habits.createTitle')}
              </Button>
            ) : undefined
          }
          description={t('habits.description')}
          eyebrow={t('habits.eyebrow')}
          title={t('habits.title')}
        />

        <Stack gap="3">
          <HStack justify="space-between" wrap="wrap">
            <HStack gap="1" role="group" aria-label={t('habits.viewsLabel')}>
              {(['today', 'week'] as const).map((item) => (
                <Button
                  colorPalette={view === item ? 'brand' : undefined}
                  key={item}
                  onClick={() => setView(item)}
                  size="sm"
                  variant={view === item ? 'subtle' : 'ghost'}
                >
                  {t(`habits.views.${item}`)}
                </Button>
              ))}
            </HStack>
            <HStack gap="1" role="group" aria-label={t('habits.stateLabel')}>
              {(['active', 'paused', 'archived'] as const).map((item) => (
                <Button
                  key={item}
                  onClick={() => setListState(item)}
                  size="sm"
                  variant={listState === item ? 'outline' : 'ghost'}
                >
                  {t(`habits.states.${item}`)}
                </Button>
              ))}
            </HStack>
          </HStack>

          <Box
            bg="bg.panel"
            borderWidth="1px"
            p={{ base: '4', md: '5' }}
            rounded="l2"
          >
            <HStack align="start" justify="space-between" mb="3">
              <Box>
                <Text fontSize="lg" fontWeight="semibold">
                  {view === 'today'
                    ? t('habits.todayHeading')
                    : t('habits.weekHeading')}
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  {view === 'today'
                    ? t('habits.todaySummary', {
                        completed: completedToday,
                        total: todayHabits.length,
                      })
                    : formatWeek(weekDates[0], weekDates[6], i18n.language)}
                </Text>
              </Box>
              {view === 'week' ? (
                <Text color="fg.muted" fontSize="sm">
                  {t('habits.weeklyTargetHint')}
                </Text>
              ) : null}
            </HStack>
            {view === 'today' ? (
              <HabitTodayList
                date={today}
                habits={todayHabits}
                isArchived={listState === 'archived'}
                isPaused={listState === 'paused'}
                isUpdating={isUpdating}
                logs={logs}
                onArchive={archive}
                onEdit={(habit) => {
                  setEditingHabit(habit)
                  setIsFormOpen(true)
                }}
                onSetState={setHabitState}
                onWriteProgress={writeProgress}
              />
            ) : habits.length ? (
              <HabitWeeklyView
                dates={weekDates}
                habits={habits}
                isArchived={listState === 'archived'}
                isPaused={listState === 'paused'}
                isUpdating={isUpdating}
                logs={logs}
                onArchive={archive}
                onEdit={(habit) => {
                  setEditingHabit(habit)
                  setIsFormOpen(true)
                }}
                onSetState={setHabitState}
              />
            ) : (
              <Text color="fg.muted" py="5">
                {t('habits.weekEmpty')}
              </Text>
            )}
          </Box>
        </Stack>
      </Stack>
      <HabitFormDialog
        habit={editingHabit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingHabit(undefined)
        }}
        onSubmit={saveHabit}
        open={isFormOpen}
      />
    </Container>
  )
}

type HabitsDashboardProps = {
  completedThisWeek: number
  completedToday: number
  dates: string[]
  habits: Habit[]
  isArchived: boolean
  isUpdating: boolean
  logs: HabitLog[]
  onArchive: (habit: Habit) => void
  onCreate: () => void
  onEdit: (habit: Habit) => void
  onSelectState: (state: HabitState) => void
  onSelectView: (view: HabitView) => void
  onWriteProgress: (habit: Habit, date: string, progress: number) => void
  scheduledThisWeek: number
  today: string
  todayHabits: Habit[]
  view: HabitView
}

function HabitsDashboard({
  completedThisWeek,
  completedToday,
  dates,
  habits,
  isArchived,
  isUpdating,
  logs,
  onArchive,
  onCreate,
  onEdit,
  onSelectState,
  onSelectView,
  onWriteProgress,
  scheduledThisWeek,
  today,
  todayHabits,
  view,
}: HabitsDashboardProps) {
  const { i18n, t } = useTranslation()
  const total = view === 'today' ? todayHabits.length : scheduledThisWeek
  const completed = view === 'today' ? completedToday : completedThisWeek
  const consistency = total ? Math.round((completed / total) * 100) : 0
  const streaks = habits
    .map((habit) => ({ habit, value: getHabitStreak(habit, logs, today) }))
    .sort((left, right) => right.value - left.value)
  const bestStreak = streaks[0]?.value ?? 0
  const title = view === 'today' ? 'Today’s habits' : 'This week'
  const summary =
    view === 'today'
      ? 'Complete your habits for today. Small steps make a big difference.'
      : formatWeek(dates[0], dates[6], i18n.language)

  return (
    <Container maxW="7xl" py={{ base: '6', md: '8' }}>
      <Stack gap="5">
        <Flex
          align={{ base: 'flex-start', md: 'center' }}
          bgImage="radial-gradient(circle at 58% 5%, var(--chakra-colors-brand-950) 0%, transparent 38%)"
          direction={{ base: 'column', md: 'row' }}
          gap="5"
          justify="space-between"
          pb={{ base: '2', md: '5' }}
        >
          <Stack gap="2">
            <Text
              color="brand.fg"
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="wider"
            >
              {t('habits.eyebrow')}
            </Text>
            <Text
              as="h1"
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="bold"
              letterSpacing="tight"
            >
              {t('habits.title')}
            </Text>
            <Text color="fg.muted" fontSize={{ base: 'md', md: 'lg' }}>
              {t('habits.description')}
            </Text>
          </Stack>
          {!isArchived ? (
            <Button colorPalette="brand" onClick={onCreate} size="lg">
              <Plus aria-hidden="true" size={19} />
              {t('habits.createTitle')}
            </Button>
          ) : null}
        </Flex>

        <Grid
          gap="4"
          templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 22.5rem' }}
        >
          <Stack gap="4" minW="0">
            <HStack justify="space-between" wrap="wrap">
              <HStack
                bg="bg.subtle"
                borderColor="border.subtle"
                borderWidth="1px"
                gap="1"
                p="1"
                rounded="l2"
                role="group"
                aria-label={t('habits.viewsLabel')}
              >
                {(['today', 'week'] as const).map((item) => (
                  <Button
                    colorPalette={view === item ? 'brand' : undefined}
                    key={item}
                    onClick={() => onSelectView(item)}
                    rounded="l1"
                    size="sm"
                    variant={view === item ? 'solid' : 'ghost'}
                  >
                    {t(`habits.views.${item}`)}
                  </Button>
                ))}
              </HStack>
              <HStack
                borderColor="border.subtle"
                borderWidth="1px"
                gap="1"
                p="1"
                rounded="l2"
                role="group"
                aria-label={t('habits.stateLabel')}
              >
                {(['active', 'archived'] as const).map((item) => (
                  <Button
                    colorPalette={
                      (!isArchived && item === 'active') ||
                      (isArchived && item === 'archived')
                        ? 'brand'
                        : undefined
                    }
                    key={item}
                    onClick={() => onSelectState(item)}
                    rounded="l1"
                    size="sm"
                    variant={
                      (!isArchived && item === 'active') ||
                      (isArchived && item === 'archived')
                        ? 'subtle'
                        : 'ghost'
                    }
                  >
                    {t(`habits.states.${item}`)}
                  </Button>
                ))}
              </HStack>
            </HStack>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3">
              <HabitMetric
                accent="brand"
                detail={
                  view === 'today'
                    ? `of ${todayHabits.length} active habits`
                    : `of ${scheduledThisWeek} on track`
                }
                icon={<Target size={19} />}
                label={
                  view === 'today' ? 'Habits due today' : 'Habits this week'
                }
                value={total}
              />
              <HabitMetric
                accent="success"
                detail={`${consistency}% of planned check-ins`}
                icon={<CheckCircle2 size={19} />}
                label={
                  view === 'today' ? 'Completed today' : 'Completed check-ins'
                }
                value={completed}
              />
              <HabitMetric
                accent="warning"
                detail={
                  view === 'today'
                    ? `Best streak: ${bestStreak} days`
                    : 'Best this week'
                }
                icon={<Flame size={19} />}
                label={view === 'today' ? 'Current streaks' : 'Current streak'}
                value={bestStreak}
              />
              <HabitMetric
                accent="brand"
                detail={
                  view === 'today' ? 'Last 7 days' : '+12% from last week'
                }
                icon={<BarChart3 size={19} />}
                label={
                  view === 'today' ? 'Consistency rate' : 'Weekly consistency'
                }
                value={`${consistency}%`}
              />
            </SimpleGrid>

            <Stack
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              gap="5"
              p={{ base: '4', md: '5' }}
              rounded="l3"
              shadow="xs"
            >
              <Flex align="start" justify="space-between" gap="3">
                <Stack gap="1">
                  <Text fontSize="xl" fontWeight="bold">
                    {title}
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    {summary}
                  </Text>
                </Stack>
                <Button size="sm" variant="outline">
                  Sort: Default
                </Button>
              </Flex>
              {view === 'today' ? (
                <HabitTodayList
                  date={today}
                  habits={todayHabits}
                  isArchived={isArchived}
                  isUpdating={isUpdating}
                  logs={logs}
                  onArchive={onArchive}
                  onEdit={onEdit}
                  onWriteProgress={onWriteProgress}
                />
              ) : habits.length ? (
                <HabitWeeklyView
                  dates={dates}
                  habits={habits}
                  isArchived={isArchived}
                  isUpdating={isUpdating}
                  logs={logs}
                  onArchive={onArchive}
                  onEdit={onEdit}
                />
              ) : (
                <Text color="fg.muted" py="6">
                  {t('habits.weekEmpty')}
                </Text>
              )}
            </Stack>
          </Stack>
          <HabitInsights
            completed={completed}
            consistency={consistency}
            dates={dates}
            streaks={streaks}
            total={total}
          />
        </Grid>
      </Stack>
    </Container>
  )
}

function HabitMetric({
  accent,
  detail,
  icon,
  label,
  value,
}: {
  accent: 'brand' | 'success' | 'warning'
  detail: string
  icon: ReactNode
  label: string
  value: string | number
}) {
  return (
    <HStack
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      gap="3"
      justify="space-between"
      p="4"
      rounded="l2"
      shadow="xs"
    >
      <HStack gap="3">
        <Box
          alignItems="center"
          bg={`${accent}.subtle`}
          color={`${accent}.fg`}
          display="flex"
          h="10"
          justifyContent="center"
          rounded="l1"
          w="10"
        >
          {icon}
        </Box>
        <Stack gap="0">
          <Text color="fg.muted" fontSize="xs">
            {label}
          </Text>
          <Text fontSize="xl" fontWeight="bold">
            {value}
          </Text>
          <Text color="fg.muted" fontSize="xs">
            {detail}
          </Text>
        </Stack>
      </HStack>
      <ChevronRight color="var(--chakra-colors-fg-subtle)" size={16} />
    </HStack>
  )
}

function HabitInsights({
  completed,
  consistency,
  dates,
  streaks,
  total,
}: {
  completed: number
  consistency: number
  dates: string[]
  streaks: { habit: Habit; value: number }[]
  total: number
}) {
  return (
    <Stack
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      gap="5"
      p={{ base: '4', md: '5' }}
      rounded="l3"
      shadow="xs"
    >
      <Stack gap="0">
        <Text fontSize="lg" fontWeight="bold">
          Today’s progress
        </Text>
        <Text color="fg.muted" fontSize="sm">
          One check-in at a time
        </Text>
      </Stack>
      <HStack align="center" gap="5">
        <Box
          alignItems="center"
          css={{
            background: `conic-gradient(var(--chakra-colors-brand-solid) ${consistency * 3.6}deg, var(--chakra-colors-bg-muted) 0)`,
          }}
          display="flex"
          h="36"
          justifyContent="center"
          p="2"
          rounded="full"
          w="36"
        >
          <Stack
            align="center"
            bg="bg.panel"
            gap="0"
            h="full"
            justify="center"
            rounded="full"
            w="full"
          >
            <Text fontSize="2xl" fontWeight="bold">
              {consistency}%
            </Text>
            <Text color="fg.muted" fontSize="xs">
              {completed} of {total}
            </Text>
            <Text color="fg.muted" fontSize="xs">
              completed
            </Text>
          </Stack>
        </Box>
        <Box
          bg="brand.subtle"
          borderColor="brand.border"
          borderWidth="1px"
          p="4"
          rounded="l2"
        >
          <Lightbulb color="var(--chakra-colors-brand-fg)" size={20} />
          <Text color="brand.fg" fontSize="sm" fontWeight="semibold" mt="2">
            Consistency today creates a better tomorrow.
          </Text>
        </Box>
      </HStack>
      <Box borderTopWidth="1px" borderColor="border.subtle" pt="4">
        <HStack gap="2">
          <Activity color="var(--chakra-colors-brand-fg)" size={17} />
          <Text fontWeight="semibold">This week’s activity</Text>
        </HStack>
        <HStack justify="space-between" mt="4">
          {dates.map((date) => (
            <Stack align="center" gap="1" key={date}>
              <Text color="fg.muted" fontSize="2xs">
                {new Intl.DateTimeFormat(undefined, {
                  weekday: 'short',
                }).format(new Date(`${date}T12:00:00`))}
              </Text>
              <Box
                bg={date === dates[0] ? 'brand.solid' : 'bg.subtle'}
                borderColor="border.emphasized"
                borderWidth="1px"
                boxSize="5"
                rounded="full"
              />
              <Text fontSize="2xs">{date.slice(-2)}</Text>
            </Stack>
          ))}
        </HStack>
      </Box>
      <Stack borderTopWidth="1px" borderColor="border.subtle" gap="2" pt="4">
        <HStack gap="2">
          <Flame color="var(--chakra-colors-warning-fg)" size={17} />
          <Text fontWeight="semibold">Streak highlights</Text>
        </HStack>
        {streaks.slice(0, 3).map(({ habit, value }) => (
          <HStack
            bg="bg.subtle"
            justify="space-between"
            key={habit.id}
            p="2.5"
            rounded="l1"
          >
            <Text fontSize="sm" fontWeight="medium" truncate>
              {habit.name}
            </Text>
            <HStack color="fg.muted" fontSize="xs">
              <Text>{value} days</Text>
              <ChevronRight size={14} />
            </HStack>
          </HStack>
        ))}
      </Stack>
    </Stack>
  )
}
