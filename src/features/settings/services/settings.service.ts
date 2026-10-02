import {
  getSettingsFromAPI,
  updateSettingsFromAPI,
} from '@/features/settings/api/settings.api'
import type {
  SettingsSnapshot,
  UpdateSettingsInput,
} from '@/features/settings/types/settings.types'
export function getSettingsSnapshot(): Promise<SettingsSnapshot> {
  return getSettingsFromAPI()
}
export function updateSettingsSnapshot(
  input: UpdateSettingsInput,
): Promise<SettingsSnapshot> {
  return updateSettingsFromAPI(input)
}
