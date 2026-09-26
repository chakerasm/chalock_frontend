import { z } from 'zod'

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
  .regex(/^\d{2}:\d{2}$/)
  .optional()

export const taskFromAPISchema = z.object({
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  description: z.string().max(2_000).optional(),
  dueDate: optionalDateSchema,
  dueTime: optionalTimeSchema,
  estimatedMinutes: z.number().int().positive().max(1_440).optional(),
  goalId: z.string().min(1).optional(),
  id: z.string().min(1),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  title: z.string().trim().min(1).max(120),
  updatedAt: z.string().datetime(),
})

export const tasksFromAPISchema = z.array(taskFromAPISchema)

export const taskListResponseFromAPISchema = z.object({
  data: tasksFromAPISchema,
  nextCursor: z.string().nullable(),
})

export const createTaskInputSchema = z.object({
  description: z.string().trim().min(1).max(2_000).optional(),
  dueDate: optionalDateSchema,
  dueTime: optionalTimeSchema,
  estimatedMinutes: z.number().int().positive().max(1_440).optional(),
  goalId: z.string().min(1).optional(),
  priority: taskPrioritySchema.optional(),
  title: z.string().trim().min(1).max(120),
})

export const updateTaskInputSchema = createTaskInputSchema.partial().extend({
  status: taskStatusSchema.optional(),
})

export const taskFormSchema = z
  .object({
    description: z.string().max(2_000),
    dueDate: z.union([z.literal(''), z.string().date()]),
    dueTime: z.union([z.literal(''), z.string().regex(/^\d{2}:\d{2}$/)]),
    estimatedMinutes: z.number().int().positive().max(1_440).optional(),
    priority: taskPrioritySchema,
    title: z.string().trim().min(1).max(120),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: 'Provide at least one task field to update.',
  })
