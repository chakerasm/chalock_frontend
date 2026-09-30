export type NotificationCategory =
  | 'tasks'
  | 'habits'
  | 'planner'
  | 'reminders'
  | 'subscriptions'
  | 'finance'
  | 'goals'

export type QuietHours = {
  enabled: boolean
  end: string
  start: string
}

export type NotificationPreferencesFromAPI = {
  browserEnabled: boolean
  categories: Record<NotificationCategory, boolean>
  inAppEnabled: boolean
  quietHours: QuietHours
  soundsEnabled: boolean
}

export type NotificationPreferences = NotificationPreferencesFromAPI
export type UpdateNotificationPreferencesInput = NotificationPreferences
