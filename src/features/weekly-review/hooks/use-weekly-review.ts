import { useEffect, useMemo, useState } from 'react'
import { useFinanceSnapshot } from '@/features/finance/hooks/use-finance'
import {
  getFocusTimerSnapshot,
  subscribeToFocusTimerSnapshot,
} from '@/features/focus/services/focus-timer.service'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { useHabitLogs, useHabits } from '@/features/habits/hooks/use-habits'
import { getLocalDate } from '@/features/habits/services/habit-calendar.service'
import { useAllTimeBlocks } from '@/features/planner/hooks/use-planner'
import {
  createWeeklyReviewSummary,
  getWeeklyReviewRange,
} from '@/features/weekly-review/services/weekly-review-calculations'
import { useSubscriptions } from '@/features/subscriptions/hooks/use-subscriptions'
import { useTasks } from '@/features/tasks/hooks/use-tasks'

export function useWeeklyReview(weekOffset: number) {
  const range = useMemo(() => getWeeklyReviewRange(weekOffset), [weekOffset])
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const [focusSnapshot, setFocusSnapshot] = useState(getFocusTimerSnapshot)
  const tasksQuery = useTasks()
  const habitsQuery = useHabits({ state: 'active' })
  const goalsQuery = useGoals()
  const plannerQuery = useAllTimeBlocks()
  const financeQuery = useFinanceSnapshot()
  const subscriptionsQuery = useSubscriptions()
  const historyFrom = (habitsQuery.data ?? []).reduce((earliest, habit) => {
    const created = getLocalDate(new Date(habit.createdAt))
    return created < earliest ? created : earliest
  }, range.from)
  const logsQuery = useHabitLogs(historyFrom, range.to)

  useEffect(
    () =>
      subscribeToFocusTimerSnapshot(() =>
        setFocusSnapshot(getFocusTimerSnapshot()),
      ),
    [],
  )

  const isPending = [
    tasksQuery,
    habitsQuery,
    goalsQuery,
    plannerQuery,
    subscriptionsQuery,
    logsQuery,
  ].some((query) => query.isPending)
  const isError = [
    tasksQuery,
    habitsQuery,
    goalsQuery,
    plannerQuery,
    subscriptionsQuery,
    logsQuery,
  ].some((query) => query.isError)
  const data = useMemo(() => {
    if (
      !tasksQuery.data ||
      !habitsQuery.data ||
      !goalsQuery.data ||
      !plannerQuery.data ||
      !subscriptionsQuery.data ||
      !logsQuery.data
    )
      return undefined
    return createWeeklyReviewSummary({
      finance: financeQuery.data ?? {
        accounts: [],
        categories: [],
        recurringTransactions: [],
        savingsGoals: [],
        transactions: [],
      },
      focusSnapshot,
      goals: goalsQuery.data,
      habitLogs: logsQuery.data,
      habits: habitsQuery.data,
      plannerBlocks: plannerQuery.data,
      range,
      subscriptions: subscriptionsQuery.data,
      tasks: tasksQuery.data,
      timeZone,
    })
  }, [
    financeQuery.data,
    focusSnapshot,
    goalsQuery.data,
    habitsQuery.data,
    logsQuery.data,
    plannerQuery.data,
    range,
    subscriptionsQuery.data,
    tasksQuery.data,
    timeZone,
  ])

  return {
    data,
    hasFinance: Boolean(financeQuery.data),
    isError,
    isPending,
    range,
    refetch: async () => {
      await Promise.all([
        tasksQuery.refetch(),
        habitsQuery.refetch(),
        goalsQuery.refetch(),
        plannerQuery.refetch(),
        financeQuery.refetch(),
        subscriptionsQuery.refetch(),
        logsQuery.refetch(),
      ])
    },
  }
}
