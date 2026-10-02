import { z } from 'zod'
import { reminderFromAPISchema } from '@/features/reminders/schemas/reminders.schemas'
import type {
  CreateReminderInput,
  ReminderFromAPI,
  UpdateReminderInput,
} from '@/features/reminders/types/reminders.types'
import { apiFetch } from '@/lib/api/client'
import { parseApiJson } from '@/lib/api/response'
const endpoint = '/api/reminders'
const json = <T>(p: Promise<Response>, s: { parse: (x: unknown) => T }) =>
  parseApiJson(p, s)
const request = (method: 'PATCH' | 'POST', body: unknown) => ({
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
  method,
})

function mapReminderWriteToAPI(
  input: Partial<CreateReminderInput> & Pick<UpdateReminderInput, 'status'>,
) {
  const { advanceOffset, note: _note, ...reminder } = input
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return {
    ...reminder,
    advanceOffset: advanceOffset?.value,
    advanceUnit: advanceOffset?.unit,
    ...(timezone && timezone.length <= 100 ? { timezone } : {}),
  }
}
const listSchema = z.union([
  z.array(reminderFromAPISchema),
  z.object({ data: z.array(reminderFromAPISchema) }).transform(({ data }) => data),
  z.object({ items: z.array(reminderFromAPISchema) }).transform(({ items }) => items),
])
export function getRemindersFromAPI(): Promise<ReminderFromAPI[]> {
  return json(apiFetch(endpoint), listSchema)
}
export function createReminderFromAPI(input: CreateReminderInput) {
  return json(
    apiFetch(endpoint, request('POST', mapReminderWriteToAPI(input))),
    reminderFromAPISchema,
  )
}
export function updateReminderFromAPI({
  reminderId,
  ...input
}: UpdateReminderInput) {
  return json(
    apiFetch(
      `${endpoint}/${encodeURIComponent(reminderId)}`,
      request('PATCH', mapReminderWriteToAPI(input)),
    ),
    reminderFromAPISchema,
  )
}
export function snoozeReminderFromAPI(id: string, minutes: number) {
  return json(
    apiFetch(
      `${endpoint}/${encodeURIComponent(id)}/snooze`,
      request('POST', {
        snoozeUntil: new Date(Date.now() + minutes * 60_000).toISOString(),
      }),
    ),
    reminderFromAPISchema,
  )
}
export function completeReminderFromAPI(id: string) {
  return json(
    apiFetch(
      `${endpoint}/${encodeURIComponent(id)}/complete`,
      request('POST', {}),
    ),
    reminderFromAPISchema,
  )
}
export async function deleteReminderFromAPI(id: string) {
  await apiFetch(`${endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
