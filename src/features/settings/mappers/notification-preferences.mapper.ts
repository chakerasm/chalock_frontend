import type {
  NotificationPreferences,
  NotificationPreferencesFromAPI,
} from '@/features/settings/types/notification-preferences.types'

export function mapNotificationPreferencesFromAPI(
  preferences: NotificationPreferencesFromAPI,
): NotificationPreferences {
  return {
    ...preferences,
    categories: { ...preferences.categories },
    quietHours: { ...preferences.quietHours },
  }
}

export function mapNotificationPreferencesToAPI(
  preferences: NotificationPreferences,
): NotificationPreferencesFromAPI {
  return {
    ...preferences,
    categories: { ...preferences.categories },
    quietHours: { ...preferences.quietHours },
  }
}
