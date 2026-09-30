import { z } from 'zod'

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

export const notificationPreferencesSchema = z
  .object({
    browserEnabled: z.boolean(),
    categories: z.object({
      finance: z.boolean(),
      goals: z.boolean(),
      habits: z.boolean(),
      planner: z.boolean(),
      reminders: z.boolean(),
      subscriptions: z.boolean(),
      tasks: z.boolean(),
    }),
    inAppEnabled: z.boolean(),
    quietHours: z.object({
      enabled: z.boolean(),
      end: timeSchema,
      start: timeSchema,
    }),
    soundsEnabled: z.boolean(),
  })
  .superRefine((value, context) => {
    if (
      value.quietHours.enabled &&
      value.quietHours.start === value.quietHours.end
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Quiet hours must have different start and end times.',
        path: ['quietHours', 'end'],
      })
    }
  })
