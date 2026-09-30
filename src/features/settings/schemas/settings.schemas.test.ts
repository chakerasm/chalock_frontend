import { describe, expect, it } from 'vitest'
import { getDefaultSettingsSnapshot } from '@/features/settings/api/settings.local-storage'
import { settingsSnapshotSchema } from '@/features/settings/schemas/settings.schemas'

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
