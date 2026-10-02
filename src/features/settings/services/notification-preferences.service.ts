import {
  getNotificationPreferencesFromAPI,
  updateNotificationPreferencesFromAPI,
} from '@/features/settings/api/settings.api'
import { notificationPreferencesSchema } from '@/features/settings/schemas/notification-preferences.schemas'
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from '@/features/settings/types/notification-preferences.types'
export function getNotificationPreferences(): Promise<NotificationPreferences> {
  return getNotificationPreferencesFromAPI()
}
export function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
): Promise<NotificationPreferences> {
  return updateNotificationPreferencesFromAPI(
    notificationPreferencesSchema.parse(input),
  )
}
