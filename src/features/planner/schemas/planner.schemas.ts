import { z } from 'zod'
import { recurrenceRuleSchema } from '@/lib/recurrence/recurrence.schemas'

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

export const plannerRecurrenceSchema = recurrenceRuleSchema

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
      recurrence: plannerRecurrenceSchema,
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
      recurrence: plannerRecurrenceSchema.optional(),
    })
    .and(createTimeRangeSchema(timeIncrementMinutes))
}

export const timeBlockFormSchema = createTimeBlockFormSchema(15)
export const timeBlockInputSchema = createTimeBlockInputSchema(15)
// Responses use the backend's portable HH:mm contract. The UI applies its
// 15-minute increment rule only when users create or edit a block.
export const timeBlockFromAPISchema = z.object({
  category: timeBlockCategorySchema.optional(),
  createdAt: z.string().datetime({ offset: true }),
  date: z.string().date(),
  description: z.string().max(2_000).optional(),
  endTime: timeSchema,
  focusSessionId: z.string().min(1).optional(),
  goalId: z.string().trim().min(1).optional(),
  id: z.string().min(1),
  occurrenceDate: z.string().date().optional(),
  recurrence: plannerRecurrenceSchema.optional(),
  seriesId: z.string().min(1).optional(),
  startTime: timeSchema,
  status: timeBlockStatusSchema,
  taskId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(120),
  updatedAt: z.string().datetime({ offset: true }),
})
