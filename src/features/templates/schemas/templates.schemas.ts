import { z } from 'zod'
import { habitScheduleSchema } from '@/features/habits/schemas/habits.schemas'
import { timeBlockCategorySchema, timeSchema } from '@/features/planner/schemas/planner.schemas'
import { taskPrioritySchema } from '@/features/tasks/schemas/tasks.schemas'

const relativeDateRuleSchema = z.discriminatedUnion('type', [z.object({ type: z.literal('today') }), z.object({ type: z.literal('tomorrow') }), z.object({ type: z.literal('days_after_apply'), days: z.number().int().min(0).max(365) }), z.object({ type: z.literal('weekday'), weekday: z.number().int().min(0).max(6) })])
const taskPayloadSchema = z.object({ title: z.string().trim().min(1).max(120), description: z.string().trim().min(1).max(2000).optional(), priority: taskPrioritySchema.optional(), estimatedMinutes: z.number().int().min(1).max(1440).optional(), relativeDueDate: relativeDateRuleSchema.optional() })
const plannerBlockSchema = z.object({ id: z.string().min(1), title: z.string().trim().min(1).max(120), description: z.string().trim().min(1).max(2000).optional(), startTime: timeSchema, endTime: timeSchema, category: timeBlockCategorySchema.optional() }).refine((block) => block.endTime > block.startTime, { message: 'End time must be after start time.', path: ['endTime'] })
const payloadSchemas = [
  z.object({ type: z.literal('task'), payload: taskPayloadSchema }),
  z.object({ type: z.literal('task_list'), payload: z.object({ tasks: z.array(taskPayloadSchema.extend({ id: z.string().min(1) })).min(1).max(50) }) }),
  z.object({ type: z.literal('planner_day'), payload: z.object({ blocks: z.array(plannerBlockSchema).min(1).max(50) }) }),
  z.object({ type: z.literal('note'), payload: z.object({ title: z.string().trim().min(1).max(120).optional(), content: z.string().min(1).max(20000) }) }),
  z.object({ type: z.literal('routine'), payload: z.object({ name: z.string().trim().min(1).max(100), description: z.string().trim().min(1).max(2000).optional(), schedule: habitScheduleSchema, targetCount: z.number().int().positive().optional(), unit: z.string().trim().min(1).max(40).optional() }) }),
] as const
const metadataSchema = z.object({ name: z.string().trim().min(1).max(120), description: z.string().trim().min(1).max(500).optional(), isFavorite: z.boolean() })
const auditSchema = z.object({ id: z.string().min(1), usageCount: z.number().int().nonnegative().optional(), lastUsedAt: z.string().datetime().optional(), createdAt: z.string().datetime(), updatedAt: z.string().datetime() })
export const createTemplateInputSchema = z.discriminatedUnion('type', payloadSchemas.map((schema) => metadataSchema.and(schema)) as never)
export const templateFromAPISchema = z.discriminatedUnion('type', payloadSchemas.map((schema) => metadataSchema.and(auditSchema).and(schema)) as never)
export const templatesFromAPISchema = z.union([z.array(templateFromAPISchema), z.object({ data: z.array(templateFromAPISchema) }).transform(({ data }) => data)])
export const updateTemplateInputSchema = z.object({ name: z.string().trim().min(1).max(120).optional(), description: z.string().trim().min(1).max(500).optional(), isFavorite: z.boolean().optional(), payload: z.unknown().optional() }).refine((input) => Object.keys(input).length > 0)
