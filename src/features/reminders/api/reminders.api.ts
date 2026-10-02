import { reminderFromAPISchema } from '@/features/reminders/schemas/reminders.schemas'
import type {
  CreateReminderInput,
  ReminderFromAPI,
  UpdateReminderInput,
} from '@/features/reminders/types/reminders.types'
import { apiFetch } from '@/lib/api/client'
const endpoint = '/api/reminders'
const json = <T>(p: Promise<Response>, s: { parse: (x: unknown) => T }) =>
  p.then(async (r) => s.parse(await r.json()))
const request = (method: 'PATCH' | 'POST', body: unknown) => ({
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
  method,
})
const listSchema = {
  parse: (value: unknown) =>
    Array.isArray(value)
      ? value.map((item) => reminderFromAPISchema.parse(item))
      : (value as { data: unknown[] }).data.map((item) =>
          reminderFromAPISchema.parse(item),
        ),
}
export function getRemindersFromAPI(): Promise<ReminderFromAPI[]> {
  return json(apiFetch(endpoint), listSchema)
}
export function createReminderFromAPI(input: CreateReminderInput) {
  return json(apiFetch(endpoint, request('POST', input)), reminderFromAPISchema)
}
export function updateReminderFromAPI({
  reminderId,
  ...input
}: UpdateReminderInput) {
  return json(
    apiFetch(
      `${endpoint}/${encodeURIComponent(reminderId)}`,
      request('PATCH', input),
    ),
    reminderFromAPISchema,
  )
}
export function snoozeReminderFromAPI(id: string, minutes: number) {
  return json(
    apiFetch(
      `${endpoint}/${encodeURIComponent(id)}/snooze`,
      request('POST', { minutes }),
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
