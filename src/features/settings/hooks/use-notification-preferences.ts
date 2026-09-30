import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/features/settings/services/notification-preferences.service'
import type { UpdateNotificationPreferencesInput } from '@/features/settings/types/notification-preferences.types'

export const notificationPreferencesQueryKeys = {
  all: ['notification-preferences'] as const,
  detail: ['notification-preferences', 'current'] as const,
}

export function useNotificationPreferences() {
  return useQuery({
    queryFn: getNotificationPreferences,
    queryKey: notificationPreferencesQueryKeys.detail,
  })
}

export function useUpdateNotificationPreferences() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateNotificationPreferencesInput) =>
      updateNotificationPreferences(input),
    onSuccess: (preferences) =>
      client.setQueryData(notificationPreferencesQueryKeys.detail, preferences),
  })
}
