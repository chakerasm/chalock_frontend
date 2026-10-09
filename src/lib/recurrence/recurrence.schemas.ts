import { z } from 'zod'

export const recurrenceRuleSchema = z
  .object({
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    ends: z.enum(['never', 'on_date', 'after_occurrences']),
    endsOn: z.string().date().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().int().min(1).max(365),
    month: z.number().int().min(1).max(12).optional(),
    occurrenceCount: z.number().int().min(1).max(10_000).optional(),
    startsOn: z.string().date(),
    timezone: z.string().trim().min(1).max(100),
    weekday: z.number().int().min(0).max(6).optional(),
    weekdays: z.array(z.number().int().min(0).max(6)).min(1).optional(),
    weekOfMonth: z
      .union([
        z.literal(-1),
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
      ])
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.ends === 'on_date' && !value.endsOn)
      context.addIssue({
        code: 'custom',
        message: 'Choose an end date.',
        path: ['endsOn'],
      })
    if (value.ends === 'after_occurrences' && !value.occurrenceCount)
      context.addIssue({
        code: 'custom',
        message: 'Choose the number of occurrences.',
        path: ['occurrenceCount'],
      })
    if (value.endsOn && value.endsOn < value.startsOn)
      context.addIssue({
        code: 'custom',
        message: 'End date must be on or after the start date.',
        path: ['endsOn'],
      })
    if (value.weekOfMonth && value.weekday === undefined)
      context.addIssue({
        code: 'custom',
        message: 'Monthly weekday rules need a weekday.',
        path: ['weekday'],
      })
  })
