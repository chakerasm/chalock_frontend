import { z } from 'zod'
import type { StatisticsDateRange } from '@/features/statistics/types/statistics.types'
import { apiFetch } from '@/lib/api/client'

const rangeSchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
  timezone: z.string().min(1),
})
const summarySchema = z.object({
  range: rangeSchema,
  tasksCompleted: z.number().int().nonnegative(),
  focus: z.object({
    totalSeconds: z.number().int().nonnegative(),
    sessionCount: z.number().int().nonnegative(),
  }),
  habits: z.object({
    completedOpportunities: z.number().int().nonnegative(),
    scheduledOpportunities: z.number().int().nonnegative(),
    completionRate: z.number().nullable(),
  }),
})
const focusSchema = z.object({
  totalSeconds: z.number().int().nonnegative(),
  sessionCount: z.number().int().nonnegative(),
  averageSessionSeconds: z.number().int().nonnegative().nullable(),
  daily: z.array(
    z.object({
      date: z.string().date(),
      totalSeconds: z.number().int().nonnegative(),
      sessionCount: z.number().int().nonnegative(),
    }),
  ),
  mostProductiveDay: z
    .object({
      date: z.string().date(),
      totalSeconds: z.number().int().nonnegative(),
    })
    .nullable(),
})
const tasksSchema = z.object({
  completedCount: z.number().int().nonnegative(),
  daily: z.array(
    z.object({
      date: z.string().date(),
      completedCount: z.number().int().nonnegative(),
    }),
  ),
  priorityCounts: z.object({
    high: z.number().int().nonnegative(),
    medium: z.number().int().nonnegative(),
    low: z.number().int().nonnegative(),
  }),
})
const habitsSchema = z.object({
  completionRate: z.number().nullable(),
  completedOpportunities: z.number().int().nonnegative(),
  scheduledOpportunities: z.number().int().nonnegative(),
  consistency: z.array(
    z.object({
      date: z.string().date(),
      completed: z.number().int().nonnegative(),
      scheduled: z.number().int().nonnegative(),
      completionRate: z.number().nullable(),
    }),
  ),
  currentStreaks: z.array(
    z.object({
      habitId: z.string().min(1),
      name: z.string(),
      count: z.number().int().nonnegative(),
      unit: z.enum(['days', 'weeks']),
    }),
  ),
})

export type StatisticsFromAPI = {
  summary: z.infer<typeof summarySchema>
  focus: z.infer<typeof focusSchema>
  tasks: z.infer<typeof tasksSchema>
  habits: z.infer<typeof habitsSchema>
}
export async function getStatisticsFromAPI(
  range: StatisticsDateRange,
  timezone: string,
): Promise<StatisticsFromAPI> {
  const query = new URLSearchParams({
    from: range.from,
    to: range.to,
    timezone,
  }).toString()
  const [summary, focus, tasks, habits] = await Promise.all([
    apiFetch(`/api/statistics/summary?${query}`),
    apiFetch(`/api/statistics/focus?${query}`),
    apiFetch(`/api/statistics/tasks?${query}`),
    apiFetch(`/api/statistics/habits?${query}`),
  ])
  return {
    summary: summarySchema.parse(await summary.json()),
    focus: focusSchema.parse(await focus.json()),
    tasks: tasksSchema.parse(await tasks.json()),
    habits: habitsSchema.parse(await habits.json()),
  }
}
