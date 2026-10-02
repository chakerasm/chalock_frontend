import { z } from 'zod'
import {
  activeFocusTimerFromAPISchema,
  focusSessionFromAPISchema,
  pomodoroCycleFromAPISchema,
  startFocusTimerInputSchema,
  startPomodoroInputSchema,
} from '@/features/focus/schemas/focus.schemas'
import type {
  FocusTimerSnapshot,
  StartFocusTimerInput,
  StartPomodoroInput,
} from '@/features/focus/types/focus.types'
import { apiFetch } from '@/lib/api/client'
import { parseApiJson } from '@/lib/api/response'

const listSchema = z.object({
  data: z.array(focusSessionFromAPISchema),
  nextCursor: z.string().nullable().optional(),
})
const actionSchema = z.enum([
  'pause',
  'resume',
  'complete',
  'cancel',
  'skip_phase',
])
const json = (method: 'PATCH' | 'POST', body: unknown) => ({
  method,
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
})

export async function getFocusTimerSnapshotFromAPI(): Promise<FocusTimerSnapshot> {
  const [sessionsResponse, timerResponse, pomodoroResponse] = await Promise.all(
    [
      apiFetch('/api/focus-sessions?limit=50'),
      apiFetch('/api/focus-sessions/active'),
      apiFetch('/api/pomodoro-cycles/active'),
    ],
  )
  const sessions = (await parseApiJson(sessionsResponse, listSchema)).data
  const activeTimer = await parseApiJson(
    timerResponse,
    activeFocusTimerFromAPISchema.nullable(),
  )
  const activePomodoro = await parseApiJson(
    pomodoroResponse,
    pomodoroCycleFromAPISchema.nullable(),
  )
  return {
    activeTimer,
    activePomodoro,
    savedSessions: sessions.filter((session) => session.status === 'completed'),
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
  action: z.infer<typeof actionSchema>,
) {
  const response = await apiFetch(
    `/api/focus-sessions/${encodeURIComponent(sessionId)}`,
    json('PATCH', { action }),
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
  action: z.infer<typeof actionSchema>,
) {
  const response = await apiFetch(
    `/api/pomodoro-cycles/${encodeURIComponent(cycleId)}`,
    json('PATCH', { action }),
  )
  return parseApiJson(response, pomodoroCycleFromAPISchema)
}
