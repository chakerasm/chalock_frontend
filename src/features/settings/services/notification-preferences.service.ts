import {
  getNotificationPreferencesFromStorage,
  saveNotificationPreferencesToStorage,
} from '@/features/settings/api/notification-preferences.local-storage'
import {
  mapNotificationPreferencesFromAPI,
  mapNotificationPreferencesToAPI,
} from '@/features/settings/mappers/notification-preferences.mapper'
import { notificationPreferencesSchema } from '@/features/settings/schemas/notification-preferences.schemas'
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from '@/features/settings/types/notification-preferences.types'

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return notificationPreferencesSchema.parse(
    mapNotificationPreferencesFromAPI(getNotificationPreferencesFromStorage()),
  )
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
): Promise<NotificationPreferences> {
  const preferences = notificationPreferencesSchema.parse(input)
  saveNotificationPreferencesToStorage(
    mapNotificationPreferencesToAPI(preferences),
  )
  return preferences
}
