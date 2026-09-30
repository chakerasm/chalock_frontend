import type { SettingsSnapshotFromAPI } from '@/features/settings/types/settings.types'

const storageKey = 'chalock.settings.v1'

function defaultTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Casablanca'
}

export function getDefaultSettingsSnapshot(): SettingsSnapshotFromAPI {
  return {
    profile: { displayName: 'Chaker Asman' },
    settings: {
      dateFormat: 'locale',
      defaultCurrency: 'MAD',
      locale: 'en',
      planning: {
        dayEndHour: 23,
        dayStartHour: 7,
        defaultBlockMinutes: 60,
        timeIncrementMinutes: 15,
      },
      theme: 'system',
      timeFormat: '24h',
      timezone: defaultTimezone(),
      weekStartsOn: 1,
    },
  }
}

export function getSettingsSnapshotFromStorage(): SettingsSnapshotFromAPI {
  const defaults = getDefaultSettingsSnapshot()
  if (typeof window === 'undefined') return defaults

  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return defaults

  try {
    const value = JSON.parse(stored) as Partial<SettingsSnapshotFromAPI>
    return {
      profile: { ...defaults.profile, ...value.profile },
      settings: {
        ...defaults.settings,
        ...value.settings,
        planning: {
          ...defaults.settings.planning,
          ...value.settings?.planning,
        },
      },
    }
  } catch {
    window.localStorage.removeItem(storageKey)
    return defaults
  }
}

export function saveSettingsSnapshotToStorage(
  snapshot: SettingsSnapshotFromAPI,
) {
  if (typeof window !== 'undefined')
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot))
}
