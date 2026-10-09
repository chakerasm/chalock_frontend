import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acknowledgeReminder,
  createReminder,
  deleteReminder,
  getReminders,
  snoozeReminder,
  updateReminder,
} from '@/features/reminders/services/reminders.service'
import type {
  CreateReminderInput,
  ReminderListFilters,
  UpdateReminderInput,
} from '@/features/reminders/types/reminders.types'

export const reminderQueryKeys = {
  all: ['reminders'] as const,
  list: (filters: ReminderListFilters) =>
    ['reminders', 'list', filters] as const,
}
export const useReminders = (filters: ReminderListFilters = {}) =>
  useQuery({
    queryFn: () => getReminders(filters),
    queryKey: reminderQueryKeys.list(filters),
  })

function useReminderMutation<T>(mutationFn: (value: T) => Promise<unknown>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: reminderQueryKeys.all }),
  })
}

export const useCreateReminder = () =>
  useReminderMutation<CreateReminderInput>(createReminder)
export const useUpdateReminder = () =>
  useReminderMutation<UpdateReminderInput>(updateReminder)
export const useDeleteReminder = () =>
  useReminderMutation<string>(deleteReminder)
export const useSnoozeReminder = () =>
  useReminderMutation<{ minutes: number; reminderId: string }>(
    ({ reminderId, minutes }) => snoozeReminder(reminderId, minutes),
  )
export const useAcknowledgeReminder = () =>
  useReminderMutation<{
    reminderId: string
    status: 'completed' | 'dismissed'
  }>(({ reminderId, status }) => acknowledgeReminder(reminderId, status))
