import { z } from 'zod'
import { recurrenceRuleSchema } from '@/lib/recurrence/recurrence.schemas'

export const taskStatusSchema = z.enum([
  'todo',
  'in_progress',
  'completed',
  'cancelled',
])

export const taskPrioritySchema = z.enum(['low', 'medium', 'high'])

const optionalDateSchema = z.string().date().optional()
const optionalTimeSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  .optional()

export const taskFromAPISchema = z.object({
  completedAt: z.string().datetime({ offset: true }).optional(),
  createdAt: z.string().datetime({ offset: true }),
  description: z.string().max(2_000).optional(),
  dueDate: optionalDateSchema,
  dueTime: optionalTimeSchema,
  estimatedMinutes: z.number().int().positive().max(1_440).optional(),
  goalId: z.string().min(1).nullable().optional(),
  id: z.string().min(1),
  priority: taskPrioritySchema.optional().default('medium'),
  occurrenceDate: z.string().date().optional(),
  recurrence: recurrenceRuleSchema.optional(),
  seriesId: z.string().min(1).optional(),
  status: taskStatusSchema,
  title: z.string().trim().min(1).max(120),
  updatedAt: z.string().datetime({ offset: true }),
})

export const tasksFromAPISchema = z.array(taskFromAPISchema)

const taskListEnvelopeSchema = z.object({
  data: tasksFromAPISchema,
  nextCursor: z.string().nullable().optional(),
})

export const taskListResponseFromAPISchema = z.union([
  taskListEnvelopeSchema,
  tasksFromAPISchema.transform((data) => ({ data })),
  z
    .object({ items: tasksFromAPISchema })
    .transform(({ items }) => ({ data: items })),
])

export const createTaskInputSchema = z.object({
  description: z.string().trim().min(1).max(2_000).optional(),
  dueDate: optionalDateSchema,
  dueTime: optionalTimeSchema,
  estimatedMinutes: z.number().int().positive().max(1_440).optional(),
  goalId: z.string().min(1).nullable().optional(),
  priority: taskPrioritySchema.optional(),
  recurrence: recurrenceRuleSchema.optional(),
  title: z.string().trim().min(1).max(120),
})

export const bulkCreateGoalTasksRequestSchema = z.object({
  tasks: z
    .array(createTaskInputSchema.omit({ goalId: true }))
    .min(1)
    .max(500),
})

export const bulkCreateGoalTasksResponseSchema = z
  .object({
    created: z.number().int().nonnegative(),
  })
  .passthrough()

export const updateTaskInputSchema = createTaskInputSchema.partial().extend({
  dueDate: optionalDateSchema.nullable(),
  goalId: z.string().min(1).nullable().optional(),
  status: taskStatusSchema.optional(),
  occurrenceDate: z.string().date().optional(),
  recurrence: recurrenceRuleSchema.optional(),
  scope: z.enum(['this', 'future', 'series']).optional(),
  title: z.string().trim().min(1).max(120),
})

export const taskFormSchema = z
  .object({
    description: z.string().max(2_000),
    dueDate: z.union([z.literal(''), z.string().date()]),
    dueTime: z.union([
      z.literal(''),
      z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    ]),
    estimatedMinutes: z.number().int().positive().max(1_440).optional(),
    goalId: z.string(),
    priority: taskPrioritySchema,
    recurrence: recurrenceRuleSchema.optional(),
    title: z.string().trim().min(1).max(120),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: 'Provide at least one task field to update.',
  })
