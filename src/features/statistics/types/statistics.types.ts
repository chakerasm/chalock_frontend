import type { FocusTimerSnapshot } from '@/features/focus/types/focus.types'
import type { Goal } from '@/features/goals/types/goals.types'
import type { Habit, HabitLog } from '@/features/habits/types/habits.types'
import type { Task, TaskPriority } from '@/features/tasks/types/tasks.types'

export type StatisticsPreset = 'last-7-days' | 'last-30-days' | 'this-month'

export type StatisticsDateRange = {
  from: string
  to: string
}

// Custom ranges are intentionally modelled even though the page currently
// exposes only presets. This keeps the aggregation boundary ready for the
// date-picker UI and future API query parameters.
export type StatisticsDateFilter =
  | { preset: StatisticsPreset; type: 'preset' }
  | ({ type: 'custom' } & StatisticsDateRange)

export type StatisticsSource = {
  focusSnapshot: FocusTimerSnapshot
  goals: Goal[]
  habitLogs: HabitLog[]
  habits: Habit[]
  now?: Date
  range: StatisticsDateRange
  tasks: Task[]
  timeZone: string
}

export type DailyStatistic = {
  completedHabits: number
  completedTasks: number
  date: string
  focusSeconds: number
  scheduledHabits: number
}

export type FocusStatistics = {
  averageSessionSeconds: number | null
  daily: DailyStatistic[]
  mostProductiveDate: string | null
  sessionCount: number
  totalSeconds: number
}

export type TaskStatistics = {
  completedCount: number
  daily: DailyStatistic[]
  priorityCounts: Record<TaskPriority, number>
}

export type HabitStreak = {
  count: number
  habitId: string
  name: string
  unit: 'days' | 'weeks'
}

export type HabitConsistencyDay = {
  completed: number
  date: string
  rate: number | null
  scheduled: number
}

export type HabitStatistics = {
  completedOpportunities: number
  completionRate: number | null
  consistency: HabitConsistencyDay[]
  scheduledOpportunities: number
  streaks: HabitStreak[]
}

export type GoalProgressOverview = {
  id: string
  progress: number
  title: string
}

export type GoalStatistics = {
  activeCount: number
  goals: GoalProgressOverview[]
}

export type StatisticsOverview = {
  focus: FocusStatistics
  goals: GoalStatistics
  habits: HabitStatistics
  range: StatisticsDateRange
  summary: {
    focusSessions: number
    habitCompletionRate: number | null
    tasksCompleted: number
    totalFocusSeconds: number
  }
  tasks: TaskStatistics
}
