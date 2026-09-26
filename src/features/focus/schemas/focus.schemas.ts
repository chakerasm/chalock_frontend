import { z } from 'zod'

export const focusSessionTypeSchema = z.enum([
  'stopwatch',
  'timer',
  'pomodoro',
  'manual',
])

export const focusSessionStatusSchema = z.enum([
  'active',
  'paused',
  'completed',
  'cancelled',
])

const optionalIdentifierSchema = z.string().trim().min(1).optional()

export const focusSessionFromAPISchema = z.object({
  durationSeconds: z.number().int().min(0),
  endedAt: z.string().datetime().optional(),
  goalId: optionalIdentifierSchema,
  id: z.string().trim().min(1),
  plannedDurationSeconds: z.number().int().positive().optional(),
  startedAt: z.string().datetime().optional(),
  status: focusSessionStatusSchema,
  taskId: optionalIdentifierSchema,
  type: focusSessionTypeSchema,
})

export const activeFocusTimerFromAPISchema = focusSessionFromAPISchema.extend({
  runningSince: z.string().datetime().optional(),
})

export const focusTimerSnapshotFromAPISchema = z.object({
  activeTimer: activeFocusTimerFromAPISchema.nullable(),
  savedSessions: z.array(focusSessionFromAPISchema).max(50),
})

export const startFocusTimerInputSchema = z
  .object({
    goalId: optionalIdentifierSchema,
    plannedDurationSeconds: z.number().int().positive().max(86_400).optional(),
    taskId: optionalIdentifierSchema,
    type: z.enum(['stopwatch', 'timer']),
  })
  .superRefine((input, context) => {
    if (input.type === 'timer' && !input.plannedDurationSeconds) {
      context.addIssue({
        code: 'custom',
        message: 'A timer needs a duration.',
        path: ['plannedDurationSeconds'],
      })
    }
    if (input.type === 'stopwatch' && input.plannedDurationSeconds) {
      context.addIssue({
        code: 'custom',
        message: 'A stopwatch cannot have a planned duration.',
        path: ['plannedDurationSeconds'],
      })
    }
  })
