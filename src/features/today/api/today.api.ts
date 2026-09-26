import {
  activeFocusSessionFromAPISchema,
  createQuickNoteInputSchema,
  createTodayTaskInputSchema,
  quickNoteFromAPISchema,
  todayDashboardFromAPISchema,
  todayTaskFromAPISchema,
  updateFocusSessionInputSchema,
  updateHabitCheckInInputSchema,
  updateTodayTaskInputSchema,
} from '@/features/today/schemas/today.schemas'
import type {
  ActiveFocusSessionFromAPI,
  CreateQuickNoteInput,
  CreateTodayTaskInput,
  QuickNoteFromAPI,
  TodayDashboardFromAPI,
  TodayTaskFromAPI,
  UpdateFocusSessionInput,
  UpdateHabitCheckInInput,
  UpdateTodayTaskInput,
} from '@/features/today/types/today.types'

const todayDashboardEndpoint = '/api/dashboard/today'

function getLocalDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

async function parseResponse<T>(
  response: Response,
  schema: { parse: (data: unknown) => T },
  errorMessage: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(errorMessage)
  }

  return schema.parse(await response.json())
}

export async function getTodayDashboardFromAPI(): Promise<TodayDashboardFromAPI> {
  return parseResponse(
    await fetch(todayDashboardEndpoint),
    todayDashboardFromAPISchema,
    'Unable to load today’s dashboard.',
  )
}

export async function createTodayTaskFromAPI(
  input: CreateTodayTaskInput,
): Promise<TodayTaskFromAPI> {
  const request = createTodayTaskInputSchema.parse(input)

  return parseResponse(
    await fetch('/api/tasks', {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
    todayTaskFromAPISchema,
    'Unable to add the task.',
  )
}

export async function updateTodayTaskFromAPI({
  completed,
  taskId,
}: UpdateTodayTaskInput): Promise<TodayTaskFromAPI> {
  const request = updateTodayTaskInputSchema.parse({ completed })

  return parseResponse(
    await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    }),
    todayTaskFromAPISchema,
    'Unable to update the task.',
  )
}

export async function updateHabitCheckInFromAPI({
  action,
  habitId,
}: UpdateHabitCheckInInput): Promise<void> {
  const request = updateHabitCheckInInputSchema.parse({
    action,
    date: getLocalDate(),
  })
  const response = await fetch(
    `/api/habits/${encodeURIComponent(habitId)}/check-ins`,
    {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  )

  if (!response.ok) {
    throw new Error('Unable to update the habit.')
  }
}

export async function startFocusSessionFromAPI(): Promise<ActiveFocusSessionFromAPI> {
  return parseResponse(
    await fetch('/api/focus-sessions', { method: 'POST' }),
    activeFocusSessionFromAPISchema,
    'Unable to start a focus session.',
  )
}

export async function updateFocusSessionFromAPI({
  elapsedSeconds,
  sessionId,
  status,
}: UpdateFocusSessionInput): Promise<ActiveFocusSessionFromAPI> {
  const request = updateFocusSessionInputSchema.parse({
    elapsedSeconds,
    status,
  })

  return parseResponse(
    await fetch(`/api/focus-sessions/${encodeURIComponent(sessionId)}`, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    }),
    activeFocusSessionFromAPISchema,
    'Unable to update the focus session.',
  )
}

export async function createQuickNoteFromAPI(
  input: CreateQuickNoteInput,
): Promise<QuickNoteFromAPI> {
  const request = createQuickNoteInputSchema.parse(input)

  return parseResponse(
    await fetch('/api/notes', {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
    quickNoteFromAPISchema,
    'Unable to save the note.',
  )
}
