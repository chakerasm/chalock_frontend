import { z } from 'zod'

export const goalStatusSchema = z.enum([
  'active',
  'paused',
  'completed',
  'archived',
])

export const goalProgressStrategySchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('manual') }),
  z.object({ mode: z.literal('task-based') }),
])

const goalInputBaseSchema = z.object({
  description: z.string().trim().min(1).max(2_000).optional(),
  goalImageUrl: z.url().optional(),
  targetDate: z.string().date().optional(),
  title: z.string().trim().min(1).max(120),
})

const manualGoalInputSchema = goalInputBaseSchema.extend({
  progress: z.number().int().min(0).max(100),
  progressStrategy: z.object({ mode: z.literal('manual') }),
})

const taskBasedGoalInputSchema = goalInputBaseSchema.extend({
  progressStrategy: z.object({ mode: z.literal('task-based') }),
})

export const createGoalInputSchema = z.union([
  manualGoalInputSchema,
  taskBasedGoalInputSchema,
])

export const goalFromAPISchema = goalInputBaseSchema.extend({
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  id: z.string().min(1),
  progress: z.number().int().min(0).max(100),
  progressStrategy: goalProgressStrategySchema,
  status: goalStatusSchema,
  updatedAt: z.string().datetime(),
})

export const goalsFromAPISchema = z.array(goalFromAPISchema)

export const updateGoalInputSchema = goalInputBaseSchema.partial().extend({
  progress: z.number().int().min(0).max(100).optional(),
  progressStrategy: goalProgressStrategySchema.optional(),
  status: goalStatusSchema.optional(),
})

const goalFormBaseSchema = z.object({
  description: z.string().max(2_000),
  goalImageUrl: z.union([z.literal(''), z.url()]),
  targetDate: z.union([z.literal(''), z.string().date()]),
  title: z.string().trim().min(1).max(120),
})

export const goalFormSchema = z.discriminatedUnion('progressMode', [
  goalFormBaseSchema.extend({
    progress: z.number().int().min(0).max(100),
    progressMode: z.literal('manual'),
  }),
  goalFormBaseSchema.extend({ progressMode: z.literal('task-based') }),
])
