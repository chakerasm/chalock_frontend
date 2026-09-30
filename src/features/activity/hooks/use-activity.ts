import { useEffect, useMemo, useState } from 'react'
import { useFinanceSnapshot } from '@/features/finance/hooks/use-finance'
import {
  getFocusTimerSnapshot,
  subscribeToFocusTimerSnapshot,
} from '@/features/focus/services/focus-timer.service'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { useHabitLogs, useHabits } from '@/features/habits/hooks/use-habits'
import { getLocalDate } from '@/features/habits/services/habit-calendar.service'
import { useNotes } from '@/features/notes/hooks/use-notes'
import { useAllTimeBlocks } from '@/features/planner/hooks/use-planner'
import { useSubscriptions } from '@/features/subscriptions/hooks/use-subscriptions'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { createActivities } from '@/features/activity/services/activity.service'

const emptyFinance = {
  accounts: [],
  categories: [],
  recurringTransactions: [],
  savingsGoals: [],
  transactions: [],
}

export function useActivity() {
  const [focusSnapshot, setFocusSnapshot] = useState(getFocusTimerSnapshot)
  const tasksQuery = useTasks()
  const habitsQuery = useHabits()
  const goalsQuery = useGoals()
  const notesQuery = useNotes()
  const plannerQuery = useAllTimeBlocks()
  const subscriptionsQuery = useSubscriptions()
  const financeQuery = useFinanceSnapshot()
  const historyFrom = (habitsQuery.data ?? []).reduce((earliest, habit) => {
    const created = getLocalDate(new Date(habit.createdAt))
    return created < earliest ? created : earliest
  }, getLocalDate(new Date()))
  const logsQuery = useHabitLogs(historyFrom, getLocalDate(new Date()))

  useEffect(
    () =>
      subscribeToFocusTimerSnapshot(() =>
        setFocusSnapshot(getFocusTimerSnapshot()),
      ),
    [],
  )

  const requiredQueries = [
    tasksQuery,
    habitsQuery,
    goalsQuery,
    notesQuery,
    plannerQuery,
    subscriptionsQuery,
    logsQuery,
  ]
  const isPending = requiredQueries.some((query) => query.isPending)
  const isError = requiredQueries.some((query) => query.isError)
  const data = useMemo(() => {
    if (
      !tasksQuery.data ||
      !habitsQuery.data ||
      !goalsQuery.data ||
      !notesQuery.data ||
      !plannerQuery.data ||
      !subscriptionsQuery.data ||
      !logsQuery.data
    ) {
      return undefined
    }

    return createActivities({
      finance: financeQuery.data ?? emptyFinance,
      focusSnapshot,
      goals: goalsQuery.data,
      habitLogs: logsQuery.data,
      habits: habitsQuery.data,
      notes: notesQuery.data,
      plannerBlocks: plannerQuery.data,
      subscriptions: subscriptionsQuery.data,
      tasks: tasksQuery.data,
    })
  }, [
    financeQuery.data,
    focusSnapshot,
    goalsQuery.data,
    habitsQuery.data,
    logsQuery.data,
    notesQuery.data,
    plannerQuery.data,
    subscriptionsQuery.data,
    tasksQuery.data,
  ])

  return {
    data,
    isError,
    isPending,
    refetch: async () => {
      await Promise.all([
        tasksQuery.refetch(),
        habitsQuery.refetch(),
        goalsQuery.refetch(),
        notesQuery.refetch(),
        plannerQuery.refetch(),
        subscriptionsQuery.refetch(),
        financeQuery.refetch(),
        logsQuery.refetch(),
      ])
    },
  }
}
