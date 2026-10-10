import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import {
  CalendarDays,
  Check,
  Clock3,
  Goal,
  ListTodo,
  Repeat2,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import { toast } from '@/components/ui/Toaster/Toaster'
import {
  type GoalPlanEntry,
  GoalPlanningDialog,
} from '@/features/goals/components/GoalPlanningDialog'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { getEndTime } from '@/features/goals/services/goal-planning.service'
import type { Goal as GoalType } from '@/features/goals/types/goals.types'
import { useHabits } from '@/features/habits/hooks/use-habits'
import {
  addLocalDays,
  getWeekStart,
  isHabitScheduledOnDate,
} from '@/features/habits/services/habit-calendar.service'
import type { Habit } from '@/features/habits/types/habits.types'
import { useFinanceSummary } from '@/features/finance/hooks/use-finance'
import {
  useAllTimeBlocks,
  useCreateTimeBlock,
} from '@/features/planner/hooks/use-planner'
import {
  formatDuration,
  getLocalDate,
  getTimeBlockDurationMinutes,
  timeToMinutes,
} from '@/features/planner/services/planner-calculations'
import { useReminders } from '@/features/reminders/hooks/use-reminders'
import { useSettings } from '@/features/settings/hooks/use-settings'
import { CarryOverReviewCard } from '@/features/tasks/components/CarryOverReviewCard'
import { useTasks, useUpdateTask } from '@/features/tasks/hooks/use-tasks'
import type { Task } from '@/features/tasks/types/tasks.types'
import { APP_ROUTES } from '@/lib/routes'

const dateLabel = (
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat(locale, options).format(new Date(`${value}T12:00:00`))

export function WeeklyPlanningPage() {
  const { i18n, t } = useTranslation()
  const today = getLocalDate()
  const weekStart = addLocalDays(getWeekStart(today), 7)
  const weekEnd = addLocalDays(weekStart, 6)
  const dates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => addLocalDays(weekStart, index)),
    [weekStart],
  )
  const tasksQuery = useTasks()
  const goalsQuery = useGoals({ status: 'active' })
  const habitsQuery = useHabits({ state: 'active' })
  const remindersQuery = useReminders()
  const blocksQuery = useAllTimeBlocks(weekStart, weekEnd)
  const financeQuery = useFinanceSummary(weekStart, weekEnd)
  const settingsQuery = useSettings()
  const updateTask = useUpdateTask()
  const createBlock = useCreateTimeBlock()
  const [carryOverVisible, setCarryOverVisible] = useState(true)
  const [planningGoal, setPlanningGoal] = useState<GoalType>()
  const tasks = tasksQuery.data ?? []
  const blocks = blocksQuery.data ?? []
  const activeTasks = tasks.filter(
    (task) => task.status === 'todo' || task.status === 'in_progress',
  )
  const carryOver = activeTasks.filter(
    (task) =>
      task.dueDate &&
      task.dueDate >= getWeekStart(today) &&
      task.dueDate < weekStart,
  )
  const priorityTasks = activeTasks
    .filter(
      (task) =>
        task.priority === 'high' ||
        Boolean(
          task.dueDate && task.dueDate >= weekStart && task.dueDate <= weekEnd,
        ),
    )
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
    .slice(0, 8)
  const plannedMinutes = blocks
    .filter((block) => block.status !== 'cancelled')
    .reduce((total, block) => total + getTimeBlockDurationMinutes(block), 0)
  const unscheduledMinutes = priorityTasks
    .filter((task) => !blocks.some((block) => block.taskId === task.id))
    .reduce((total, task) => total + (task.estimatedMinutes ?? 0), 0)
  const hours = settingsQuery.data?.settings.planning
  const availableMinutes = hours
    ? Math.max(
        0,
        (hours.dayEndHour - hours.dayStartHour) * 7 * 60 - plannedMinutes,
      )
    : undefined
  const scheduledTaskIds = new Set(
    blocks.flatMap((block) => (block.taskId ? [block.taskId] : [])),
  )
  const reminders = (remindersQuery.data ?? []).filter(
    (reminder) =>
      reminder.status === 'scheduled' &&
      reminder.triggerAt &&
      reminder.triggerAt.slice(0, 10) >= weekStart &&
      reminder.triggerAt.slice(0, 10) <= weekEnd,
  )
  const dayPlans = dates.map((date) => {
    const items = blocks.filter(
      (block) => block.date === date && block.status !== 'cancelled',
    )
    return {
      date,
      conflict: items.some((block, index) =>
        items.some(
          (other, otherIndex) =>
            index !== otherIndex &&
            timeToMinutes(block.startTime) < timeToMinutes(other.endTime) &&
            timeToMinutes(block.endTime) > timeToMinutes(other.startTime),
        ),
      ),
      minutes: items.reduce(
        (sum, block) => sum + getTimeBlockDurationMinutes(block),
        0,
      ),
    }
  })

  function updateCarryOver(selected: Task[], dueDate: string | null) {
    selected.forEach((task) =>
      updateTask.mutate({ dueDate, taskId: task.id, title: task.title }),
    )
  }
  function completeCarryOver(selected: Task[]) {
    selected.forEach((task) =>
      updateTask.mutate({
        status: 'completed',
        taskId: task.id,
        title: task.title,
      }),
    )
  }
  async function confirmGoalPlan(entries: GoalPlanEntry[]) {
    if (!planningGoal) return false
    const tasksById = new Map(
      tasks
        .filter((task) => task.goalId === planningGoal.id)
        .map((task) => [task.id, task]),
    )
    try {
      for (const entry of entries) {
        const task = tasksById.get(entry.taskId)
        if (task)
          await createBlock.mutateAsync({
            date: entry.date,
            endTime: getEndTime(entry.startTime, entry.durationMinutes),
            goalId: planningGoal.id,
            startTime: entry.startTime,
            taskId: task.id,
            title: task.title,
          })
      }
      setPlanningGoal(undefined)
      return true
    } catch {
      toast.error({ title: t('planner.saveError') })
      return false
    }
  }

  return (
    <Container maxW="7xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '6', md: '8' }}>
        <PageHeader
          actions={
            <Button asChild size="sm" variant="outline">
              <Link to={APP_ROUTES.review}>{t('weeklyPlanning.review')}</Link>
            </Button>
          }
          description={`${dateLabel(weekStart, i18n.language, { day: 'numeric', month: 'short' })}–${dateLabel(weekEnd, i18n.language, { day: 'numeric', month: 'short' })}`}
          eyebrow={t('weeklyPlanning.nextWeek')}
          title={t('weeklyPlanning.title')}
        />
        <SimpleGrid
          columns={{ base: 1, sm: availableMinutes === undefined ? 2 : 3 }}
          gap="3"
        >
          {availableMinutes === undefined ? null : (
            <Metric
              icon={Clock3}
              label={t('weeklyPlanning.available')}
              value={formatDuration(availableMinutes)}
            />
          )}
          <Metric
            icon={CalendarDays}
            label={t('weeklyPlanning.scheduled')}
            value={formatDuration(plannedMinutes)}
          />
          <Metric
            icon={ListTodo}
            label={t('weeklyPlanning.unscheduled')}
            value={formatDuration(unscheduledMinutes)}
          />
        </SimpleGrid>
        {carryOverVisible && carryOver.length ? (
          <Box>
            <Heading
              description={t('weeklyPlanning.carryOverDescription')}
              icon={ListTodo}
              title={t('weeklyPlanning.carryOver')}
            />
            <CarryOverReviewCard
              isUpdating={updateTask.isPending}
              onComplete={completeCarryOver}
              onReschedule={updateCarryOver}
              onSkip={() => setCarryOverVisible(false)}
              plannerBlocks={blocks}
              tasks={carryOver}
            />
          </Box>
        ) : null}
        <Section icon={Goal} title={t('weeklyPlanning.goals')}>
          <Stack gap="2">
            {(goalsQuery.data ?? []).map((goal) => {
              const remaining = activeTasks.filter(
                (task) => task.goalId === goal.id,
              )
              return (
                <Flex
                  align={{ base: 'start', sm: 'center' }}
                  borderColor="border.subtle"
                  borderWidth="1px"
                  direction={{ base: 'column', sm: 'row' }}
                  gap="3"
                  justify="space-between"
                  key={goal.id}
                  p="3"
                  rounded="l1"
                >
                  <Stack gap="0">
                    <Text fontWeight="semibold">
                      <PrivateText>{goal.title}</PrivateText>
                    </Text>
                    <Text color="fg.muted" fontSize="sm">
                      {t('weeklyPlanning.remaining', {
                        count: remaining.length,
                      })}{' '}
                      ·{' '}
                      {formatDuration(
                        remaining.reduce(
                          (sum, task) => sum + (task.estimatedMinutes ?? 0),
                          0,
                        ),
                      )}
                    </Text>
                  </Stack>
                  <Button
                    onClick={() => setPlanningGoal(goal)}
                    size="sm"
                    variant="outline"
                  >
                    {t('weeklyPlanning.planGoal')}
                  </Button>
                </Flex>
              )
            })}
          </Stack>
        </Section>
        <Section
          description={t('weeklyPlanning.priorityDescription')}
          icon={ListTodo}
          title={t('weeklyPlanning.priority')}
        >
          <Stack gap="2">
            {priorityTasks.map((task) => (
              <Flex
                align="center"
                borderColor="border.subtle"
                borderWidth="1px"
                gap="3"
                justify="space-between"
                key={task.id}
                p="3"
                rounded="l1"
              >
                <Stack gap="0" minW="0">
                  <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                    <PrivateText>{task.title}</PrivateText>
                  </Text>
                  <Text color="fg.muted" fontSize="xs">
                    {task.dueDate ?? '—'} ·{' '}
                    {task.estimatedMinutes
                      ? formatDuration(task.estimatedMinutes)
                      : '—'}
                  </Text>
                </Stack>
                {scheduledTaskIds.has(task.id) ? (
                  <Text color="success.fg" fontSize="xs">
                    {t('weeklyPlanning.scheduled')}
                  </Text>
                ) : (
                  <Button asChild size="xs" variant="outline">
                    <Link
                      search={{
                        date:
                          task.dueDate &&
                          task.dueDate >= weekStart &&
                          task.dueDate <= weekEnd
                            ? task.dueDate
                            : weekStart,
                      }}
                      to={APP_ROUTES.planner}
                    >
                      {t('weeklyPlanning.schedule')}
                    </Link>
                  </Button>
                )}
              </Flex>
            ))}
          </Stack>
        </Section>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
          <Section
            description={t('weeklyPlanning.routinesDescription')}
            icon={Repeat2}
            title={t('weeklyPlanning.routines')}
          >
            <Stack gap="2">
              {(habitsQuery.data ?? []).map((habit) => (
                <Flex justify="space-between" key={habit.id}>
                  <Text fontSize="sm">{habit.name}</Text>
                  <Text color="fg.muted" fontSize="sm">
                    {habitSchedule(habit, dates, i18n.language, t)}
                  </Text>
                </Flex>
              ))}
            </Stack>
          </Section>
          <Section icon={CalendarDays} title={t('weeklyPlanning.reminders')}>
            <Stack gap="2">
              {reminders.map((reminder) => (
                <Flex justify="space-between" key={reminder.id}>
                  <Text fontSize="sm">{reminder.title}</Text>
                  <Text color="fg.muted" fontSize="sm">
                    {dateLabel(
                      reminder.triggerAt!.slice(0, 10),
                      i18n.language,
                      { weekday: 'short', day: 'numeric' },
                    )}
                  </Text>
                </Flex>
              ))}
              {financeQuery.data?.upcomingPayments.map((payment) => (
                <Flex justify="space-between" key={payment.id}>
                  <HStack gap="2">
                    <WalletCards aria-hidden="true" size={14} />
                    <Text fontSize="sm">{payment.title}</Text>
                  </HStack>
                  <Text color="fg.muted" fontSize="sm">
                    {payment.date}
                  </Text>
                </Flex>
              ))}
              {!reminders.length &&
              !financeQuery.data?.upcomingPayments.length ? (
                <Text color="fg.muted" fontSize="sm">
                  {t('weeklyPlanning.noReminders')}
                </Text>
              ) : null}
            </Stack>
          </Section>
        </SimpleGrid>
        <Section
          description={t('weeklyPlanning.plannerDescription')}
          icon={CalendarDays}
          title={t('weeklyPlanning.planner')}
        >
          <SimpleGrid columns={{ base: 2, md: 7 }} gap="2">
            {dayPlans.map((day) => (
              <Box
                bg={day.conflict ? 'warning.subtle' : 'bg.subtle'}
                key={day.date}
                p="3"
                rounded="l1"
              >
                <Text fontSize="xs" fontWeight="semibold">
                  {dateLabel(day.date, i18n.language, { weekday: 'short' })}
                </Text>
                <Text fontWeight="bold">{formatDuration(day.minutes)}</Text>
                <Text
                  color={day.conflict ? 'warning.fg' : 'fg.muted'}
                  fontSize="xs"
                >
                  {day.conflict
                    ? t('weeklyPlanning.conflict')
                    : day.minutes
                      ? t('weeklyPlanning.busy')
                      : t('weeklyPlanning.open')}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Section>
        <Section icon={Check} title={t('weeklyPlanning.finalReview')}>
          <HStack color="fg.muted" fontSize="sm" wrap="wrap">
            <Text>
              {t('weeklyPlanning.tasksScheduled', {
                count: scheduledTaskIds.size,
              })}
            </Text>
            <Text>
              {t('weeklyPlanning.habitsCount', {
                count: (habitsQuery.data ?? []).length,
              })}
            </Text>
            <Text>
              {t('weeklyPlanning.remindersCount', { count: reminders.length })}
            </Text>
          </HStack>
          <Button
            alignSelf="start"
            colorPalette="brand"
            mt="4"
            onClick={() =>
              toast.success({ title: t('weeklyPlanning.finished') })
            }
          >
            <Check aria-hidden="true" size={17} />
            {t('weeklyPlanning.finish')}
          </Button>
        </Section>
      </Stack>
      <GoalPlanningDialog
        goalId={planningGoal?.id ?? ''}
        isSaving={createBlock.isPending}
        onConfirm={confirmGoalPlan}
        onOpenChange={(open) => {
          if (!open) setPlanningGoal(undefined)
        }}
        open={Boolean(planningGoal)}
        planningWeekStart={weekStart}
        plannerBlocks={blocks}
        tasks={
          planningGoal
            ? tasks.filter((task) => task.goalId === planningGoal.id)
            : []
        }
      />
    </Container>
  )
}

function habitSchedule(
  habit: Habit,
  dates: string[],
  locale: string,
  t: (key: string, values?: Record<string, unknown>) => string,
) {
  if (habit.schedule.type === 'weekly-target')
    return t('weeklyPlanning.weeklyTarget', { count: habit.targetCount ?? 0 })
  return dates
    .filter((date) => isHabitScheduledOnDate(habit, date))
    .map((date) => dateLabel(date, locale, { weekday: 'short' }))
    .join(' ')
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <Flex
      align="center"
      bg="bg.panel"
      borderWidth="1px"
      gap="3"
      p="4"
      rounded="l2"
      shadow="xs"
    >
      <Box bg="brand.subtle" color="brand.fg" p="2" rounded="full">
        <Icon aria-hidden="true" size={18} />
      </Box>
      <Stack gap="0">
        <Text color="fg.muted" fontSize="xs">
          {label}
        </Text>
        <Text fontSize="lg" fontWeight="bold">
          {value}
        </Text>
      </Stack>
    </Flex>
  )
}
function Section({
  children,
  description,
  icon,
  title,
}: {
  children: React.ReactNode
  description?: string
  icon: LucideIcon
  title: string
}) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l2"
      shadow="xs"
    >
      <Heading description={description} icon={icon} title={title} />
      {children}
    </Box>
  )
}
function Heading({
  description,
  icon: Icon,
  title,
}: {
  description?: string
  icon: LucideIcon
  title: string
}) {
  return (
    <Stack gap="1" mb="4">
      <HStack gap="2">
        <Box color="brand.fg">
          <Icon aria-hidden="true" size={18} />
        </Box>
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
      </HStack>
      {description ? (
        <Text color="fg.muted" fontSize="sm">
          {description}
        </Text>
      ) : null}
    </Stack>
  )
}
