import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveGoal,
  createGoal,
  getGoal,
  getGoals,
  updateGoal,
} from "@/features/goals/services/goals.service";
import type {
  CreateGoalInput,
  GoalListFilter,
  UpdateGoalInput,
} from "@/features/goals/types/goals.types";

export const goalQueryKeys = {
  all: ["goals"] as const,
  detail: (goalId: string) => [...goalQueryKeys.all, "detail", goalId] as const,
  list: (filters: GoalListFilter) =>
    [...goalQueryKeys.all, "list", filters] as const,
};

export function useGoals(filters: GoalListFilter = {}, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getGoals(filters),
    queryKey: goalQueryKeys.list(filters),
  });
}

export function useGoal(goalId: string) {
  return useQuery({
    queryFn: () => getGoal(goalId),
    queryKey: goalQueryKeys.detail(goalId),
  });
}

function useGoalMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: goalQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
        queryClient.invalidateQueries({ queryKey: ["today-dashboard"] }),
      ]);
    },
  });
}

export function useCreateGoal() {
  return useGoalMutation((input: CreateGoalInput) => createGoal(input));
}

export function useUpdateGoal() {
  return useGoalMutation((input: UpdateGoalInput) => updateGoal(input));
}

export function useArchiveGoal() {
  return useGoalMutation((goalId: string) => archiveGoal(goalId));
}
