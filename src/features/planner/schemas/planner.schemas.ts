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
export const planningTimeSchema = timeSchema.refine(
  (value) => Number(value.slice(-2)) % 15 === 0,
  'Use a 15-minute increment.',
)

const optionalIdentifierSchema = z
  .union([z.string().trim().min(1), z.literal('')])
  .optional()
  .transform((value) => value || undefined)

const timeRangeSchema = z
  .object({ endTime: planningTimeSchema, startTime: planningTimeSchema })
  .superRefine((value, context) => {
    if (value.endTime <= value.startTime) {
      context.addIssue({
        code: 'custom',
        message: 'End time must be after start time.',
        path: ['endTime'],
      })
    }
  })

export const timeBlockFormSchema = z
  .object({
    category: z.union([timeBlockCategorySchema, z.literal('')]),
    date: z.string().date(),
    description: z.string().max(2_000),
    endTime: planningTimeSchema,
    goalId: z.string(),
    startTime: planningTimeSchema,
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
export const timeBlockInputSchema = z
  .object({
    category: timeBlockCategorySchema.optional(),
    date: z.string().date(),
    description: z.string().trim().min(1).max(2_000).optional(),
    endTime: planningTimeSchema,
    goalId: optionalIdentifierSchema,
    startTime: planningTimeSchema,
    taskId: optionalIdentifierSchema,
    title: z.string().trim().min(1).max(120),
  })
  .and(timeRangeSchema)

export const timeBlockFromAPISchema = timeBlockInputSchema.and(
  z.object({
    createdAt: z.string().datetime(),
    focusSessionId: z.string().min(1).optional(),
    id: z.string().min(1),
    status: timeBlockStatusSchema,
    updatedAt: z.string().datetime(),
  }),
)
