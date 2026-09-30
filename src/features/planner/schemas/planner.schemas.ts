import { z } from 'zod'

export const timeBlockCategorySchema = z.enum([
  'focus',
  'work',
  'personal',
  'study',
  'fitness',
  'break',
  'routine',
  'other',
])

export const timeBlockStatusSchema = z.enum([
  'planned',
  'in_progress',
  'completed',
  'cancelled',
])

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

export function createPlanningTimeSchema(timeIncrementMinutes: number) {
  return timeSchema.refine(
    (value) => Number(value.slice(-2)) % timeIncrementMinutes === 0,
    `Use a ${timeIncrementMinutes}-minute increment.`,
  )
}

export const planningTimeSchema = createPlanningTimeSchema(15)

const optionalIdentifierSchema = z
  .union([z.string().trim().min(1), z.literal('')])
  .optional()
  .transform((value) => value || undefined)

function createTimeRangeSchema(timeIncrementMinutes: number) {
  const planningTime = createPlanningTimeSchema(timeIncrementMinutes)
  return z
    .object({ endTime: planningTime, startTime: planningTime })
    .superRefine((value, context) => {
      if (value.endTime <= value.startTime) {
        context.addIssue({
          code: 'custom',
          message: 'End time must be after start time.',
          path: ['endTime'],
        })
      }
    })
}

export function createTimeBlockFormSchema(timeIncrementMinutes: number) {
  const planningTime = createPlanningTimeSchema(timeIncrementMinutes)
  return z
    .object({
      category: z.union([timeBlockCategorySchema, z.literal('')]),
      date: z.string().date(),
      description: z.string().max(2_000),
      endTime: planningTime,
      goalId: z.string(),
      startTime: planningTime,
      taskId: z.string(),
      title: z.string().trim().min(1).max(120),
    })
    .superRefine((value, context) => {
      if (value.endTime <= value.startTime) {
        context.addIssue({
          code: 'custom',
          message: 'End time must be after start time.',
          path: ['endTime'],
        })
      }
    })
}

export function createTimeBlockInputSchema(timeIncrementMinutes: number) {
  const planningTime = createPlanningTimeSchema(timeIncrementMinutes)
  return z
    .object({
      category: timeBlockCategorySchema.optional(),
      date: z.string().date(),
      description: z.string().trim().min(1).max(2_000).optional(),
      endTime: planningTime,
      goalId: optionalIdentifierSchema,
      startTime: planningTime,
      taskId: optionalIdentifierSchema,
      title: z.string().trim().min(1).max(120),
    })
    .and(createTimeRangeSchema(timeIncrementMinutes))
}

export const timeBlockFormSchema = createTimeBlockFormSchema(15)
export const timeBlockInputSchema = createTimeBlockInputSchema(15)
export const timeBlockFromAPISchema = timeBlockInputSchema.and(
  z.object({
    createdAt: z.string().datetime(),
    focusSessionId: z.string().min(1).optional(),
    id: z.string().min(1),
    status: timeBlockStatusSchema,
    updatedAt: z.string().datetime(),
  }),
)
