import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getStatisticsFromAPI } from '@/features/statistics/api/statistics.api'
import { getGoalProgressSummary } from '@/features/goals/services/goal-progress.service'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { getStatisticsPresetRange } from '@/features/statistics/services/statistics.service'
import type {
  StatisticsOverview,
  StatisticsPreset,
} from '@/features/statistics/types/statistics.types'

export function useStatistics(preset: StatisticsPreset) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const range = useMemo(() => getStatisticsPresetRange(preset), [preset])
  const statisticsQuery = useQuery({
    queryKey: ['statistics', range, timezone],
    queryFn: () => getStatisticsFromAPI(range, timezone),
  })
  const goalsQuery = useGoals({ status: 'active' })
  const tasksQuery = useTasks()
  const data = useMemo<StatisticsOverview | undefined>(() => {
    if (!statisticsQuery.data || !goalsQuery.data || !tasksQuery.data)
      return undefined
    const { summary, focus, tasks, habits } = statisticsQuery.data
    return {
      range,
      summary: {
        focusSessions: summary.focus.sessionCount,
        totalFocusSeconds: summary.focus.totalSeconds,
        tasksCompleted: summary.tasksCompleted,
        habitCompletionRate: summary.habits.completionRate,
      },
      focus: {
        totalSeconds: focus.totalSeconds,
        sessionCount: focus.sessionCount,
        averageSessionSeconds: focus.averageSessionSeconds,
        mostProductiveDate: focus.mostProductiveDay?.date ?? null,
        daily: focus.daily.map((day) => ({
          date: day.date,
          focusSeconds: day.totalSeconds,
          completedTasks: 0,
          completedHabits: 0,
          scheduledHabits: 0,
        })),
      },
      tasks: {
        completedCount: tasks.completedCount,
        priorityCounts: tasks.priorityCounts,
        daily: tasks.daily.map((day) => ({
          date: day.date,
          focusSeconds: 0,
          completedTasks: day.completedCount,
          completedHabits: 0,
          scheduledHabits: 0,
        })),
      },
      habits: {
        completionRate: habits.completionRate,
        completedOpportunities: habits.completedOpportunities,
        scheduledOpportunities: habits.scheduledOpportunities,
        consistency: habits.consistency.map((day) => ({
          date: day.date,
          completed: day.completed,
          scheduled: day.scheduled,
          rate: day.completionRate,
        })),
        streaks: habits.currentStreaks,
      },
      goals: {
        activeCount: goalsQuery.data.length,
        goals: goalsQuery.data
          .map((goal) => ({
            id: goal.id,
            title: goal.title,
            progress: getGoalProgressSummary(goal, tasksQuery.data).progress,
          }))
          .sort(
            (a, b) => b.progress - a.progress || a.title.localeCompare(b.title),
          ),
      },
    }
  }, [goalsQuery.data, range, statisticsQuery.data, tasksQuery.data])
  return {
    data,
    isPending:
      statisticsQuery.isPending || goalsQuery.isPending || tasksQuery.isPending,
    isError:
      statisticsQuery.isError || goalsQuery.isError || tasksQuery.isError,
    refetch: async () => {
      await Promise.all([
        statisticsQuery.refetch(),
        goalsQuery.refetch(),
        tasksQuery.refetch(),
      ])
    },
  }
}
