import {
  getRemindersFromStorage,
  saveRemindersToStorage,
} from '@/features/reminders/api/reminders.local-storage'
import {
  mapReminderFromAPI,
  mapReminderToAPI,
} from '@/features/reminders/mappers/reminders.mapper'
import { reminderInputSchema } from '@/features/reminders/schemas/reminders.schemas'
import type {
  CreateReminderInput,
  Reminder,
  UpdateReminderInput,
} from '@/features/reminders/types/reminders.types'

const id = () =>
  `reminder-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`
const now = () => new Date().toISOString()
const save = (reminders: Reminder[]) =>
  saveRemindersToStorage(reminders.map(mapReminderToAPI))

export async function getReminders() {
  return getRemindersFromStorage().map(mapReminderFromAPI)
}

export async function createReminder(input: CreateReminderInput) {
  const request = reminderInputSchema.parse(input)
  const timestamp = now()
  const reminder: Reminder = {
    ...request,
    createdAt: timestamp,
    id: id(),
    status: 'scheduled',
    updatedAt: timestamp,
  }
  save([...(await getReminders()), reminder])
  return reminder
}

export async function updateReminder({
  reminderId,
  ...input
}: UpdateReminderInput) {
  const reminders = await getReminders()
  const current = reminders.find((reminder) => reminder.id === reminderId)
  if (!current) throw new Error('Reminder not found.')
  const request = reminderInputSchema.parse({ ...current, ...input })
  const reminder: Reminder = {
    ...current,
    ...request,
    status: input.status ?? current.status,
    updatedAt: now(),
  }
  save(reminders.map((item) => (item.id === reminderId ? reminder : item)))
  return reminder
}

export async function deleteReminder(reminderId: string) {
  const reminders = await getReminders()
  if (!reminders.some((reminder) => reminder.id === reminderId))
    throw new Error('Reminder not found.')
  save(reminders.filter((reminder) => reminder.id !== reminderId))
}

export async function snoozeReminder(reminderId: string, minutes: number) {
  const reminders = await getReminders()
  const current = reminders.find((reminder) => reminder.id === reminderId)
  if (!current) throw new Error('Reminder not found.')
  const reminder = {
    ...current,
    snoozedUntil: new Date(Date.now() + minutes * 60_000).toISOString(),
    status: 'scheduled' as const,
    updatedAt: now(),
  }
  save(reminders.map((item) => (item.id === reminderId ? reminder : item)))
  return reminder
}

export async function acknowledgeReminder(
  reminderId: string,
  status: 'completed' | 'dismissed',
) {
  const reminders = await getReminders()
  const current = reminders.find((reminder) => reminder.id === reminderId)
  if (!current) throw new Error('Reminder not found.')
  const timestamp = now()
  const reminder: Reminder = current.recurrence
    ? {
        ...current,
        lastHandledAt: timestamp,
        snoozedUntil: undefined,
        status: 'scheduled',
        updatedAt: timestamp,
      }
    : { ...current, status, updatedAt: timestamp }
  save(reminders.map((item) => (item.id === reminderId ? reminder : item)))
  return reminder
}
