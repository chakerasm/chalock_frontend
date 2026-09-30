import { getGoalProgressSummary } from '@/features/goals/services/goal-progress.service'
import {
  addLocalDays,
  getLocalDate,
  getWeekStart,
  isHabitScheduledOnDate,
} from '@/features/habits/services/habit-calendar.service'
import { getStatisticsOverview } from '@/features/statistics/services/statistics.service'
import { getUpcomingRenewals } from '@/features/subscriptions/services/subscription-calculations'
import type { FinanceSnapshot } from '@/features/finance/types/finance.types'
import type { FocusTimerSnapshot } from '@/features/focus/types/focus.types'
import type { Goal } from '@/features/goals/types/goals.types'
import type { Habit, HabitLog } from '@/features/habits/types/habits.types'
import type { TimeBlock } from '@/features/planner/types/planner.types'
import type { Subscription } from '@/features/subscriptions/types/subscriptions.types'
import type { Task } from '@/features/tasks/types/tasks.types'
import type {
  WeeklyReviewRange,
  WeeklyReviewSummary,
} from '@/features/weekly-review/types/weekly-review.types'

export function getWeeklyReviewRange(
  offset = 0,
  now = new Date(),
): WeeklyReviewRange {
  const from = addLocalDays(getWeekStart(getLocalDate(now)), offset * 7)
  return { from, to: addLocalDays(from, 6) }
}

export function isDateInWeeklyReviewRange(
  date: string | undefined,
  range: WeeklyReviewRange,
) {
  return Boolean(date && date >= range.from && date <= range.to)
}

export function createWeeklyReviewSummary({
  finance,
  focusSnapshot,
  goals,
  habitLogs,
  habits,
  plannerBlocks,
  range,
  subscriptions,
  tasks,
  timeZone,
}: {
  finance: FinanceSnapshot
  focusSnapshot: FocusTimerSnapshot
  goals: Goal[]
  habitLogs: HabitLog[]
  habits: Habit[]
  plannerBlocks: TimeBlock[]
  range: WeeklyReviewRange
  subscriptions: Subscription[]
  tasks: Task[]
  timeZone: string
}): WeeklyReviewSummary {
  const statistics = getStatisticsOverview({
    focusSnapshot,
    goals,
    habitLogs,
    habits,
    range,
    tasks,
    timeZone,
  })
  const completed = tasks.filter(
    (task) =>
      task.status === 'completed' &&
      isDateInWeeklyReviewRange(task.completedAt?.slice(0, 10), range),
  )
  const cancelled = tasks.filter(
    (task) =>
      task.status === 'cancelled' &&
      isDateInWeeklyReviewRange(task.updatedAt.slice(0, 10), range),
  )
  const unfinished = tasks.filter(
    (task) => task.status === 'todo' || task.status === 'in_progress',
  )
  const blocks = plannerBlocks.filter((block) =>
    isDateInWeeklyReviewRange(block.date, range),
  )
  const plannedBlocks = blocks.filter((block) => block.status !== 'cancelled')
  const transactions = finance.transactions.filter((transaction) =>
    isDateInWeeklyReviewRange(transaction.transactionDate, range),
  )
  const totals = (type: 'expense' | 'income') => {
    const values = new Map<string, number>()
    for (const transaction of transactions) {
      if (transaction.type !== type) continue
      values.set(
        transaction.currency,
        (values.get(transaction.currency) ?? 0) + transaction.amount,
      )
    }
    return [...values].map(([currency, value]) => ({ currency, value }))
  }
  const categoryNames = new Map(
    finance.categories.map((category) => [category.id, category.name]),
  )
  const largestCategories = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce<Map<string, { currency: string; name: string; value: number }>>(
      (values, transaction) => {
        const name = transaction.categoryId
          ? (categoryNames.get(transaction.categoryId) ?? 'Other')
          : 'Other'
        const key = `${transaction.currency}:${name}`
        const current = values.get(key) ?? {
          currency: transaction.currency,
          name,
          value: 0,
        }
        values.set(key, {
          ...current,
          value: current.value + transaction.amount,
        })
        return values
      },
      new Map(),
    )

  const dates = Array.from({ length: 7 }, (_, index) =>
    addLocalDays(range.from, index),
  )
  const habitConsistency = habits.map((habit) => {
    if (habit.schedule.type === 'weekly-target') {
      const progress = habitLogs
        .filter(
          (log) =>
            log.habitId === habit.id &&
            isDateInWeeklyReviewRange(log.date, range),
        )
        .reduce((total, log) => total + log.progress, 0)
      return {
        completed: progress >= (habit.targetCount ?? 0) ? 1 : 0,
        id: habit.id,
        name: habit.name,
        scheduled: 1,
      }
    }
    const scheduledDates = dates.filter(
      (date) =>
        date >= habit.createdAt.slice(0, 10) &&
        isHabitScheduledOnDate(habit, date),
    )
    const completed = habitLogs.filter(
      (log) =>
        log.habitId === habit.id &&
        scheduledDates.includes(log.date) &&
        log.completed,
    ).length
    return {
      completed,
      id: habit.id,
      name: habit.name,
      scheduled: scheduledDates.length,
    }
  })
  return {
    finance: {
      expenses: totals('expense'),
      income: totals('income'),
      largestCategories: [...largestCategories.values()]
        .sort((left, right) => right.value - left.value)
        .slice(0, 3),
      recurringPayments: finance.recurringTransactions.filter((transaction) =>
        isDateInWeeklyReviewRange(transaction.nextOccurrenceDate, range),
      ).length,
      upcomingRenewals: getUpcomingRenewals(
        subscriptions,
        7,
        new Date(`${range.to}T12:00:00`),
      ).map((subscription) => ({
        date: subscription.nextBillingDate,
        name: subscription.name,
      })),
    },
    habits: habitConsistency,
    goals: {
      completed: goals.filter(
        (goal) =>
          goal.status === 'completed' &&
          isDateInWeeklyReviewRange(goal.completedAt?.slice(0, 10), range),
      ).length,
      items: goals
        .filter(
          (goal) => goal.status === 'active' || goal.status === 'completed',
        )
        .map((goal) => ({
          id: goal.id,
          progress: getGoalProgressSummary(goal, tasks).progress,
          title: goal.title,
        }))
        .sort((left, right) => right.progress - left.progress)
        .slice(0, 4),
    },
    planner: {
      completed: plannedBlocks.filter((block) => block.status === 'completed')
        .length,
      plannedMinutes: plannedBlocks.reduce((total, block) => {
        const [startHour, startMinute] = block.startTime.split(':').map(Number)
        const [endHour, endMinute] = block.endTime.split(':').map(Number)
        return total + endHour * 60 + endMinute - (startHour * 60 + startMinute)
      }, 0),
      total: plannedBlocks.length,
    },
    statistics,
    tasks: {
      cancelled: cancelled.length,
      completed: completed.length,
      unfinished,
    },
  }
}
