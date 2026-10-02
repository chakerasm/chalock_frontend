import { describe, expect, it } from 'vitest'
import { settingsSnapshotSchema } from '@/features/settings/schemas/settings.schemas'

const getDefaultSettingsSnapshot = () => ({
  profile: { displayName: 'Chaker Asman' },
  settings: {
    dateFormat: 'locale' as const,
    defaultCurrency: 'MAD',
    locale: 'en',
    planning: {
      dayEndHour: 23,
      dayStartHour: 7,
      defaultBlockMinutes: 60,
      timeIncrementMinutes: 15,
    },
    theme: 'system' as const,
    timeFormat: '24h' as const,
    timezone: 'Africa/Casablanca',
    weekStartsOn: 1,
  },
})
describe('settingsSnapshotSchema', () => {
  it('accepts the default profile and preferences', () => {
    expect(
      settingsSnapshotSchema.safeParse(getDefaultSettingsSnapshot()).success,
    ).toBe(true)
  })

  it('requires the planning day to end after it starts', () => {
    const snapshot = getDefaultSettingsSnapshot()
    snapshot.settings.planning.dayEndHour =
      snapshot.settings.planning.dayStartHour

    expect(settingsSnapshotSchema.safeParse(snapshot).success).toBe(false)
  })

  it('requires the default block duration to align with its grid increment', () => {
    const snapshot = getDefaultSettingsSnapshot()
    snapshot.settings.planning.defaultBlockMinutes = 50

    expect(settingsSnapshotSchema.safeParse(snapshot).success).toBe(false)
  })
})
