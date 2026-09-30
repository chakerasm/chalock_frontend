import type {
  SettingsSnapshot,
  SettingsSnapshotFromAPI,
} from '@/features/settings/types/settings.types'

export function mapSettingsSnapshotFromAPI(
  snapshot: SettingsSnapshotFromAPI,
): SettingsSnapshot {
  return {
    ...snapshot,
    profile: { ...snapshot.profile },
    settings: {
      ...snapshot.settings,
      planning: { ...snapshot.settings.planning },
    },
  }
}

export function mapSettingsSnapshotToAPI(
  snapshot: SettingsSnapshot,
): SettingsSnapshotFromAPI {
  return {
    ...snapshot,
    profile: { ...snapshot.profile },
    settings: {
      ...snapshot.settings,
      planning: { ...snapshot.settings.planning },
    },
  }
}
