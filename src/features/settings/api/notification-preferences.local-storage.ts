import type { NotificationPreferencesFromAPI } from '@/features/settings/types/notification-preferences.types'

const storageKey = 'chalock.notification-preferences.v1'

export function getDefaultNotificationPreferences(): NotificationPreferencesFromAPI {
  return {
    browserEnabled: false,
    categories: {
      finance: true,
      goals: true,
      habits: true,
      planner: true,
      reminders: true,
      subscriptions: true,
      tasks: true,
    },
    inAppEnabled: true,
    quietHours: { enabled: false, end: '07:00', start: '22:00' },
    soundsEnabled: false,
  }
}

export function getNotificationPreferencesFromStorage(): NotificationPreferencesFromAPI {
  const defaults = getDefaultNotificationPreferences()
  if (typeof window === 'undefined') return defaults

  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return defaults

  try {
    const value = JSON.parse(stored) as Partial<NotificationPreferencesFromAPI>
    return {
      ...defaults,
      ...value,
      categories: { ...defaults.categories, ...value.categories },
      quietHours: { ...defaults.quietHours, ...value.quietHours },
    }
  } catch {
    window.localStorage.removeItem(storageKey)
    return defaults
  }
}

export function saveNotificationPreferencesToStorage(
  preferences: NotificationPreferencesFromAPI,
) {
  if (typeof window !== 'undefined')
    window.localStorage.setItem(storageKey, JSON.stringify(preferences))
}
