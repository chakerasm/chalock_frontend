import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuickNote,
  createTodayTask,
  getTodayDashboard,
  startFocusSession,
  updateFocusSession,
  updateHabitCheckIn,
  updateTodayTask,
} from "@/features/today/services/today.service";

export const todayDashboardQueryKeys = {
  all: ["today-dashboard"] as const,
  dashboard: () => [...todayDashboardQueryKeys.all, "today"] as const,
};

export function useTodayDashboard() {
  return useQuery({
    queryFn: getTodayDashboard,
    queryKey: todayDashboardQueryKeys.dashboard(),
  });
}

function useDashboardMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  invalidateHabits = false,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: todayDashboardQueryKeys.dashboard(),
        }),
        ...(invalidateHabits
          ? [queryClient.invalidateQueries({ queryKey: ["habits"] })]
          : []),
      ]);
    },
  });
}

export function useCreateTodayTask() {
  return useDashboardMutation(createTodayTask);
}

export function useUpdateTodayTask() {
  return useDashboardMutation(updateTodayTask);
}

export function useUpdateHabitCheckIn() {
  return useDashboardMutation(updateHabitCheckIn, true);
}

export function useStartFocusSession() {
  return useDashboardMutation(startFocusSession);
}

export function useUpdateFocusSession() {
  return useDashboardMutation(updateFocusSession);
}

export function useCreateQuickNote() {
  return useDashboardMutation(createQuickNote);
}
