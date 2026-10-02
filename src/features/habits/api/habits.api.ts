import {
  createHabitInputSchema,
  habitFromAPISchema,
  habitLogFromAPISchema,
  habitLogsFromAPISchema,
  habitsFromAPISchema,
  updateHabitInputSchema,
  writeHabitLogInputSchema,
} from '@/features/habits/schemas/habits.schemas'
import type {
  CreateHabitInput,
  Habit,
  HabitListFilter,
  HabitLog,
  UpdateHabitInput,
  WriteHabitLogInput,
} from '@/features/habits/types/habits.types'
import { apiFetch } from '@/lib/api/client'
import { parseApiJson } from '@/lib/api/response'

async function parseResponse<T>(
  response: Response,
  schema: { parse: (data: unknown) => T },
  errorMessage: string,
): Promise<T> {
  if (!response.ok) throw new Error(errorMessage)
  return parseApiJson(response, schema)
}

export async function getHabitsFromAPI(filters: HabitListFilter = {}) {
  const params = new URLSearchParams()
  if (filters.state) params.set('state', filters.state)
  const query = params.size ? `?${params}` : ''
  return parseResponse(
    await apiFetch(`/api/habits${query}`),
    habitsFromAPISchema,
    'Unable to load habits.',
  )
}

export async function createHabitFromAPI(input: CreateHabitInput) {
  const request = createHabitInputSchema.parse(input)
  return parseResponse(
    await apiFetch('/api/habits', {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
    habitFromAPISchema,
    'Unable to create the habit.',
  )
}

export async function updateHabitFromAPI({
  habitId,
  ...input
}: UpdateHabitInput) {
  const request = updateHabitInputSchema.parse(input)
  return parseResponse(
    await apiFetch(`/api/habits/${encodeURIComponent(habitId)}`, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    }),
    habitFromAPISchema,
    'Unable to update the habit.',
  )
}

export async function archiveHabitFromAPI(habitId: string) {
  return parseResponse(
    await apiFetch(`/api/habits/${encodeURIComponent(habitId)}/archive`, {
      method: 'POST',
    }),
    habitFromAPISchema,
    'Unable to archive the habit.',
  )
}

export async function getHabitLogsFromAPI(
  habitId: string,
  from: string,
  to: string,
) {
  const params = new URLSearchParams({ from, to })
  return parseResponse(
    await apiFetch(
      `/api/habits/${encodeURIComponent(habitId)}/logs?${params.toString()}`,
    ),
    habitLogsFromAPISchema,
    'Unable to load habit history.',
  )
}

export async function getAllHabitLogsFromAPI(from: string, to: string) {
  const params = new URLSearchParams({ from, to })
  return parseResponse(
    await apiFetch(`/api/habit-logs?${params.toString()}`),
    habitLogsFromAPISchema,
    'Unable to load habit history.',
  )
}

export async function writeHabitLogFromAPI(
  habitId: string,
  date: string,
  input: WriteHabitLogInput,
): Promise<HabitLog> {
  const request = writeHabitLogInputSchema.parse(input)
  return parseResponse(
    await apiFetch(
      `/api/habits/${encodeURIComponent(habitId)}/logs/${encodeURIComponent(date)}`,
      {
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      },
    ),
    habitLogFromAPISchema,
    'Unable to save habit progress.',
  )
}

export type { Habit, HabitLog }
