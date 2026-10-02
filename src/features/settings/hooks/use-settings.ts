import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getSettingsSnapshot,
  updateSettingsSnapshot,
} from '@/features/settings/services/settings.service'
import type { UpdateSettingsInput } from '@/features/settings/types/settings.types'

export const settingsQueryKeys = {
  all: ['settings'] as const,
  snapshot: ['settings', 'snapshot'] as const,
}

export function useSettings(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getSettingsSnapshot,
    queryKey: settingsQueryKeys.snapshot,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => updateSettingsSnapshot(input),
    onSuccess: (snapshot) =>
      queryClient.setQueryData(settingsQueryKeys.snapshot, snapshot),
  })
}

export function useDefaultCurrency(enabled = true) {
  return useSettings(enabled).data?.settings.defaultCurrency ?? 'MAD'
}
