import { z } from 'zod'

const currencySchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/)

export const userProfileSchema = z.object({
  avatarUrl: z.string().trim().url().optional().or(z.literal('')),
  bio: z.string().trim().max(280).optional().or(z.literal('')),
  displayName: z.string().trim().min(1).max(80),
})

export const planningPreferencesSchema = z
  .object({
    dayEndHour: z.number().int().min(1).max(23),
    dayStartHour: z.number().int().min(0).max(22),
    defaultBlockMinutes: z.number().int().min(5).max(240),
    timeIncrementMinutes: z.union([
      z.literal(5),
      z.literal(10),
      z.literal(15),
      z.literal(30),
    ]),
  })
  .superRefine((value, context) => {
    if (value.dayEndHour <= value.dayStartHour) {
      context.addIssue({
        code: 'custom',
        message: 'Day end must be after day start.',
        path: ['dayEndHour'],
      })
    }
    if (value.defaultBlockMinutes % value.timeIncrementMinutes !== 0) {
      context.addIssue({
        code: 'custom',
        message: 'Default duration must use the selected time increment.',
        path: ['defaultBlockMinutes'],
      })
    }
  })

export const userSettingsSchema = z.object({
  dateFormat: z.enum(['locale', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  defaultCurrency: currencySchema,
  locale: z.enum(['en', 'fr']),
  planning: planningPreferencesSchema,
  theme: z.enum(['system', 'light', 'dark']),
  timeFormat: z.enum(['12h', '24h']),
  timezone: z.string().trim().min(1),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
})

export const settingsSnapshotSchema = z.object({
  profile: userProfileSchema,
  settings: userSettingsSchema,
})
