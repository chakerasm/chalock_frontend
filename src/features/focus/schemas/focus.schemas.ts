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

export const pomodoroPhaseSchema = z.enum([
  'focus',
  'short_break',
  'long_break',
])

export const pomodoroPhaseStatusSchema = z.enum(['active', 'paused'])

export const pomodoroCompletionStateSchema = z.enum([
  'completed',
  'skipped',
  'cancelled',
])

export const pomodoroCycleFromAPISchema = z.object({
  completedFocusSessions: z.number().int().min(0).max(12),
  focusDurationSeconds: z.number().int().positive().max(86_400),
  focusSessionsUntilLongBreak: z.number().int().positive().max(12),
  goalId: optionalIdentifierSchema,
  id: z.string().trim().min(1),
  intention: z.string().trim().min(1).max(120).optional(),
  longBreakDurationSeconds: z.number().int().positive().max(86_400),
  phase: pomodoroPhaseSchema,
  phaseElapsedSeconds: z.number().int().min(0),
  phaseStartedAt: z.string().datetime().optional(),
  shortBreakDurationSeconds: z.number().int().positive().max(86_400),
  startedAt: z.string().datetime(),
  status: pomodoroPhaseStatusSchema,
  taskId: optionalIdentifierSchema,
})

export const pomodoroHistoryItemFromAPISchema = z.object({
  completionState: pomodoroCompletionStateSchema,
  durationSeconds: z.number().int().min(0),
  endedAt: z.string().datetime(),
  goalId: optionalIdentifierSchema,
  id: z.string().trim().min(1),
  intention: z.string().trim().min(1).max(120).optional(),
  taskId: optionalIdentifierSchema,
})

export const focusTimerSnapshotFromAPISchema = z.object({
  activePomodoro: pomodoroCycleFromAPISchema.nullable().default(null),
  activeTimer: activeFocusTimerFromAPISchema.nullable(),
  pomodoroHistory: z
    .array(pomodoroHistoryItemFromAPISchema)
    .max(50)
    .default([]),
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

export const startPomodoroInputSchema = z.object({
  goalId: optionalIdentifierSchema,
  intention: z.string().trim().min(1).max(120).optional(),
  taskId: optionalIdentifierSchema,
})
