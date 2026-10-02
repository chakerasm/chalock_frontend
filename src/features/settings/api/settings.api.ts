import { notificationPreferencesSchema } from '@/features/settings/schemas/notification-preferences.schemas'
import {
  settingsSnapshotSchema,
  userProfileSchema,
  userSettingsSchema,
} from '@/features/settings/schemas/settings.schemas'
import type { NotificationPreferences } from '@/features/settings/types/notification-preferences.types'
import type {
  SettingsSnapshot,
  UpdateSettingsInput,
} from '@/features/settings/types/settings.types'
import { apiFetch } from '@/lib/api/client'

async function json<T>(
  request: Promise<Response>,
  schema: { parse: (data: unknown) => T },
) {
  return schema.parse(await (await request).json())
}
const patch = (body: unknown) => ({
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
  method: 'PATCH' as const,
})

export async function getSettingsFromAPI(): Promise<SettingsSnapshot> {
  const [profile, settings] = await Promise.all([
    json(apiFetch('/api/me'), userProfileSchema),
    json(apiFetch('/api/me/settings'), userSettingsSchema),
  ])
  return settingsSnapshotSchema.parse({ profile, settings })
}
export async function updateSettingsFromAPI(
  input: UpdateSettingsInput,
): Promise<SettingsSnapshot> {
  const snapshot = settingsSnapshotSchema.parse(input)
  const [profile, settings] = await Promise.all([
    json(apiFetch('/api/me', patch(snapshot.profile)), userProfileSchema),
    json(
      apiFetch('/api/me/settings', patch(snapshot.settings)),
      userSettingsSchema,
    ),
  ])
  return { profile, settings }
}
export function getNotificationPreferencesFromAPI(): Promise<NotificationPreferences> {
  return json(
    apiFetch('/api/me/notification-preferences'),
    notificationPreferencesSchema,
  )
}
export function updateNotificationPreferencesFromAPI(
  input: NotificationPreferences,
): Promise<NotificationPreferences> {
  return json(
    apiFetch('/api/me/notification-preferences', patch(input)),
    notificationPreferencesSchema,
  )
}
