import { z } from 'zod'

export const reminderStatusSchema = z.enum([
  'scheduled',
  'triggered',
  'completed',
  'dismissed',
  'cancelled',
])
export const reminderEntityTypeSchema = z.enum([
  'task',
  'subscription',
  'habit',
  'goal',
  'time_block',
  'custom',
])
export const reminderOffsetSchema = z.object({
  unit: z.enum(['minute', 'hour', 'day', 'week']),
  value: z.number().int().positive().max(365),
})
export const reminderRecurrenceSchema = z.object({
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1).optional(),
  endDate: z.string().date().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().int().positive().max(365),
  month: z.number().int().min(1).max(12).optional(),
})

const optionalIdentifierSchema = z
  .union([z.string().trim().min(1), z.literal('')])
  .optional()
  .transform((value) => value || undefined)

export const reminderInputSchema = z
  .object({
    advanceOffset: reminderOffsetSchema.optional(),
    entityId: optionalIdentifierSchema,
    entityType: reminderEntityTypeSchema.optional(),
    note: z.string().trim().min(1).max(2_000).optional(),
    recurrence: reminderRecurrenceSchema.optional(),
    title: z.string().trim().min(1).max(120),
    triggerAt: z.string().datetime().optional(),
  })
  .superRefine((value, context) => {
    if (!value.triggerAt && !value.advanceOffset) {
      context.addIssue({
        code: 'custom',
        message: 'Choose a time or a relative reminder offset.',
        path: ['triggerAt'],
      })
    }
    if (value.advanceOffset && (!value.entityType || !value.entityId)) {
      context.addIssue({
        code: 'custom',
        message: 'Relative reminders need a related item.',
        path: ['entityId'],
      })
    }
  })

export const reminderFromAPISchema = reminderInputSchema.and(
  z.object({
    createdAt: z.string().datetime(),
    lastHandledAt: z.string().datetime().optional(),
    id: z.string().min(1),
    snoozedUntil: z.string().datetime().optional(),
    status: reminderStatusSchema,
    updatedAt: z.string().datetime(),
  }),
)
