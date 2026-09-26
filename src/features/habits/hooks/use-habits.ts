import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveHabit,
  createHabit,
  getHabitLogs,
  getHabits,
  updateHabit,
  writeHabitLog,
} from '@/features/habits/services/habits.service'
import type {
  CreateHabitInput,
  HabitListFilter,
  UpdateHabitInput,
  WriteHabitLogInput,
} from '@/features/habits/types/habits.types'

export const habitQueryKeys = {
  all: ['habits'] as const,
  list: (filters: HabitListFilter) =>
    [...habitQueryKeys.all, 'list', filters] as const,
  logs: (from: string, to: string) =>
    [...habitQueryKeys.all, 'logs', from, to] as const,
}

export function useHabits(filters: HabitListFilter = {}) {
  return useQuery({
    queryFn: () => getHabits(filters),
    queryKey: habitQueryKeys.list(filters),
  })
}

export function useHabitLogs(from: string, to: string) {
  return useQuery({
    queryFn: () => getHabitLogs(from, to),
    queryKey: habitQueryKeys.logs(from, to),
  })
}

function useHabitMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: habitQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['today-dashboard'] }),
      ])
    },
  })
}

export function useCreateHabit() {
  return useHabitMutation((input: CreateHabitInput) => createHabit(input))
}

export function useUpdateHabit() {
  return useHabitMutation((input: UpdateHabitInput) => updateHabit(input))
}

export function useArchiveHabit() {
  return useHabitMutation((habitId: string) => archiveHabit(habitId))
}

export function useWriteHabitLog() {
  return useHabitMutation(
    (input: { date: string; habitId: string; log: WriteHabitLogInput }) =>
      writeHabitLog(input.habitId, input.date, input.log),
  )
}
