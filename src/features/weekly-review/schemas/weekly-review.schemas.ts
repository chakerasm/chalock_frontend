import { z } from 'zod'

export const weeklyReflectionSchema = z.object({
  difficult: z.string().trim().max(2_000).optional(),
  focusNextWeek: z.string().trim().max(2_000).optional(),
  weekStart: z.string().date(),
  wentWell: z.string().trim().max(2_000).optional(),
})
