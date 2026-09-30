import type {
  Reminder,
  ReminderFromAPI,
} from '@/features/reminders/types/reminders.types'

export const mapReminderFromAPI = (reminder: ReminderFromAPI): Reminder => ({
  ...reminder,
})
export const mapReminderToAPI = (reminder: Reminder): ReminderFromAPI => ({
  ...reminder,
})
