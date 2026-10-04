import { z } from 'zod'
import {
  activeFocusTimerFromAPISchema,
  focusSessionFromAPISchema,
  pomodoroCycleFromAPISchema,
  startFocusTimerInputSchema,
  startPomodoroInputSchema,
  updateFocusSessionInputSchema,
  updatePomodoroCycleInputSchema,
} from '@/features/focus/schemas/focus.schemas'
import type {
  FocusAction,
  FocusTimerSnapshot,
  StartFocusTimerInput,
  StartPomodoroInput,
  UpdateFocusSessionInput,
} from '@/features/focus/types/focus.types'
import { apiFetch } from '@/lib/api/client'
import { parseApiJson } from '@/lib/api/response'

const listSchema = z.object({
  data: z.array(focusSessionFromAPISchema),
  nextCursor: z.string().nullable().optional(),
})
const json = (method: 'PATCH' | 'POST', body: unknown) => ({
  method,
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
})

export async function getFocusTimerSnapshotFromAPI(): Promise<FocusTimerSnapshot> {
  const [activeTimerResult, sessionsResult, activePomodoroResult] =
    await Promise.allSettled([
      apiFetch('/api/focus-sessions/active').then((response) =>
        parseApiJson(response, activeFocusTimerFromAPISchema.nullable()),
      ),
      apiFetch('/api/focus-sessions?limit=50').then((response) =>
        parseApiJson(response, listSchema),
      ),
      apiFetch('/api/pomodoro-cycles/active').then((response) =>
        parseApiJson(response, pomodoroCycleFromAPISchema.nullable()),
      ),
    ])

  if (activeTimerResult.status === 'rejected') throw activeTimerResult.reason

  return {
    activeTimer: activeTimerResult.value,
    activePomodoro:
      activePomodoroResult.status === 'fulfilled'
        ? activePomodoroResult.value
        : null,
    savedSessions:
      sessionsResult.status === 'fulfilled'
        ? sessionsResult.value.data.filter(
            (session) => session.status === 'completed',
          )
        : [],
    pomodoroHistory: [],
  }
}

export async function startFocusTimerFromAPI(input: StartFocusTimerInput) {
  const response = await apiFetch(
    '/api/focus-sessions',
    json('POST', startFocusTimerInputSchema.parse(input)),
  )
  return parseApiJson(response, activeFocusTimerFromAPISchema)
}
export async function updateFocusTimerFromAPI(
  sessionId: string,
  input: UpdateFocusSessionInput,
) {
  const response = await apiFetch(
    `/api/focus-sessions/${encodeURIComponent(sessionId)}`,
    json('PATCH', updateFocusSessionInputSchema.parse(input)),
  )
  return parseApiJson(response, activeFocusTimerFromAPISchema)
}
export async function startPomodoroFromAPI(input: StartPomodoroInput) {
  const response = await apiFetch(
    '/api/pomodoro-cycles',
    json('POST', startPomodoroInputSchema.parse(input)),
  )
  return parseApiJson(response, pomodoroCycleFromAPISchema)
}
export async function updatePomodoroFromAPI(
  cycleId: string,
  action: Exclude<FocusAction, 'complete'> | 'skip_phase',
) {
  const response = await apiFetch(
    `/api/pomodoro-cycles/${encodeURIComponent(cycleId)}`,
    json('PATCH', updatePomodoroCycleInputSchema.parse({ action })),
  )
  return parseApiJson(response, pomodoroCycleFromAPISchema)
}
