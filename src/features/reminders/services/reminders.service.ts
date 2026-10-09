import {
  completeReminderFromAPI,
  createReminderFromAPI,
  deleteReminderFromAPI,
  getRemindersFromAPI,
  snoozeReminderFromAPI,
  updateReminderFromAPI,
} from '@/features/reminders/api/reminders.api'
import { mapReminderFromAPI } from '@/features/reminders/mappers/reminders.mapper'
import { reminderInputSchema } from '@/features/reminders/schemas/reminders.schemas'
import type {
  CreateReminderInput,
  Reminder,
  ReminderListFilters,
  UpdateReminderInput,
} from '@/features/reminders/types/reminders.types'
export async function getReminders(
  filters: ReminderListFilters = {},
): Promise<Reminder[]> {
  return (await getRemindersFromAPI(filters)).map(mapReminderFromAPI)
}
export async function createReminder(input: CreateReminderInput) {
  return mapReminderFromAPI(
    await createReminderFromAPI(reminderInputSchema.parse(input)),
  )
}
export async function updateReminder({
  reminderId,
  ...input
}: UpdateReminderInput) {
  return mapReminderFromAPI(
    await updateReminderFromAPI({ reminderId, ...input }),
  )
}
export function deleteReminder(id: string) {
  return deleteReminderFromAPI(id)
}
export function snoozeReminder(id: string, minutes: number) {
  return snoozeReminderFromAPI(id, minutes).then(mapReminderFromAPI)
}
export async function acknowledgeReminder(
  id: string,
  status: 'completed' | 'dismissed',
) {
  return status === 'completed'
    ? mapReminderFromAPI(await completeReminderFromAPI(id))
    : mapReminderFromAPI(
        await updateReminderFromAPI({ reminderId: id, status }),
      )
}
