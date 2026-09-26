import { useEffect, useMemo, useState } from 'react'
import {
  getFocusTimerSnapshot,
  subscribeToFocusTimerSnapshot,
} from '@/features/focus/services/focus-timer.service'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { useHabitLogs, useHabits } from '@/features/habits/hooks/use-habits'
import { getLocalDate } from '@/features/habits/services/habit-calendar.service'
import {
  getDateInTimeZone,
  getStatisticsOverview,
  getStatisticsPresetRange,
} from '@/features/statistics/services/statistics.service'
import type { StatisticsPreset } from '@/features/statistics/types/statistics.types'
import { useTasks } from '@/features/tasks/hooks/use-tasks'

export function useStatistics(preset: StatisticsPreset) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const range = useMemo(() => getStatisticsPresetRange(preset), [preset])
  const [focusSnapshot, setFocusSnapshot] = useState(getFocusTimerSnapshot)
  const tasksQuery = useTasks()
  const habitsQuery = useHabits({ state: 'active' })
  const goalsQuery = useGoals({ status: 'active' })
  const habitHistoryFrom = (habitsQuery.data ?? []).reduce(
    (earliest, habit) => {
      const createdOn =
        getDateInTimeZone(habit.createdAt, timeZone) ?? getLocalDate()
      return createdOn < earliest ? createdOn : earliest
    },
    range.from,
  )
  const logsQuery = useHabitLogs(habitHistoryFrom, range.to)

  useEffect(
    () =>
      subscribeToFocusTimerSnapshot(() =>
        setFocusSnapshot(getFocusTimerSnapshot()),
      ),
    [],
  )

  const isPending =
    tasksQuery.isPending ||
    habitsQuery.isPending ||
    goalsQuery.isPending ||
    logsQuery.isPending
  const isError =
    tasksQuery.isError ||
    habitsQuery.isError ||
    goalsQuery.isError ||
    logsQuery.isError
  const data = useMemo(() => {
    if (
      !tasksQuery.data ||
      !habitsQuery.data ||
      !goalsQuery.data ||
      !logsQuery.data
    ) {
      return undefined
    }
    return getStatisticsOverview({
      focusSnapshot,
      goals: goalsQuery.data,
      habitLogs: logsQuery.data,
      habits: habitsQuery.data,
      range,
      tasks: tasksQuery.data,
      timeZone,
    })
  }, [
    focusSnapshot,
    goalsQuery.data,
    habitsQuery.data,
    logsQuery.data,
    range,
    tasksQuery.data,
    timeZone,
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
        logsQuery.refetch(),
      ])
    },
  }
}
