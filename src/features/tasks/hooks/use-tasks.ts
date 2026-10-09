import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  bulkCreateGoalTasks,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '@/features/tasks/services/tasks.service'
import type {
  BulkCreateGoalTasksRequest,
  DeleteTaskInput,
  TaskListFilters,
} from '@/features/tasks/types/tasks.types'

export const taskQueryKeys = {
  all: ['tasks'] as const,
  list: (filters: TaskListFilters) => [...taskQueryKeys.all, filters] as const,
}

export function useTasks(filters: TaskListFilters = {}, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getTasks(filters),
    queryKey: taskQueryKeys.list(filters),
  })
}

function useTaskMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: ['goals'],
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({ queryKey: ['today-dashboard'] }),
      ])
    },
  })
}

export function useCreateTask() {
  return useTaskMutation(createTask)
}

export function useBulkCreateGoalTasks() {
  return useTaskMutation(
    ({ goalId, ...input }: BulkCreateGoalTasksRequest & { goalId: string }) =>
      bulkCreateGoalTasks(goalId, input),
  )
}

export function useUpdateTask() {
  return useTaskMutation(updateTask)
}

export function useDeleteTask() {
  return useTaskMutation<DeleteTaskInput>(deleteTask)
}
