import {
  getSettingsSnapshotFromStorage,
  saveSettingsSnapshotToStorage,
} from '@/features/settings/api/settings.local-storage'
import {
  mapSettingsSnapshotFromAPI,
  mapSettingsSnapshotToAPI,
} from '@/features/settings/mappers/settings.mapper'
import { settingsSnapshotSchema } from '@/features/settings/schemas/settings.schemas'
import type {
  SettingsSnapshot,
  UpdateSettingsInput,
} from '@/features/settings/types/settings.types'

export async function getSettingsSnapshot(): Promise<SettingsSnapshot> {
  return settingsSnapshotSchema.parse(
    mapSettingsSnapshotFromAPI(getSettingsSnapshotFromStorage()),
  )
}

export function getSettingsSnapshotSync(): SettingsSnapshot {
  return settingsSnapshotSchema.parse(
    mapSettingsSnapshotFromAPI(getSettingsSnapshotFromStorage()),
  )
}

export async function updateSettingsSnapshot(
  input: UpdateSettingsInput,
): Promise<SettingsSnapshot> {
  const snapshot = settingsSnapshotSchema.parse(input)
  saveSettingsSnapshotToStorage(mapSettingsSnapshotToAPI(snapshot))
  return snapshot
}
