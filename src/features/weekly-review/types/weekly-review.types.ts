import type { StatisticsOverview } from '@/features/statistics/types/statistics.types'
import type { Task } from '@/features/tasks/types/tasks.types'

export type WeeklyReviewRange = {
  from: string
  to: string
}

export type WeeklyReflectionFromAPI = {
  difficult?: string
  focusNextWeek?: string
  updatedAt: string
  weekStart: string
  wentWell?: string
}

export type WeeklyReflection = WeeklyReflectionFromAPI

export type WeeklyReviewSummary = {
  finance: {
    expenses: Array<{ currency: string; value: number }>
    income: Array<{ currency: string; value: number }>
    largestCategories: Array<{ currency: string; name: string; value: number }>
    recurringPayments: number
    upcomingRenewals: Array<{ date: string; name: string }>
  }
  habits: Array<{
    completed: number
    id: string
    name: string
    scheduled: number
  }>
  goals: {
    completed: number
    items: Array<{ id: string; progress: number; title: string }>
  }
  planner: {
    completed: number
    plannedMinutes: number
    total: number
  }
  statistics: StatisticsOverview
  tasks: {
    cancelled: number
    completed: number
    unfinished: Task[]
  }
}
