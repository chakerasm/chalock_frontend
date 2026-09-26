import type {
  ActiveFocusSession,
  ActiveFocusSessionFromAPI,
  ActiveGoal,
  ActiveGoalFromAPI,
  FocusSummary,
  FocusSummaryFromAPI,
  TodayDashboard,
  TodayDashboardFromAPI,
  TodayHabit,
  TodayHabitFromAPI,
  TodayTask,
  TodayTaskFromAPI,
} from "@/features/today/types/today.types";

export function mapTodayTaskFromAPI(task: TodayTaskFromAPI): TodayTask {
  return { ...task };
}

export function mapTodayTaskToAPI(task: TodayTask): TodayTaskFromAPI {
  return { ...task };
}

export function mapTodayHabitFromAPI(habit: TodayHabitFromAPI): TodayHabit {
  return { ...habit };
}

export function mapTodayHabitToAPI(habit: TodayHabit): TodayHabitFromAPI {
  return { ...habit };
}

export function mapFocusSummaryFromAPI(
  summary: FocusSummaryFromAPI,
): FocusSummary {
  return { ...summary };
}

export function mapFocusSummaryToAPI(
  summary: FocusSummary,
): FocusSummaryFromAPI {
  return { ...summary };
}

export function mapActiveFocusSessionFromAPI(
  session: ActiveFocusSessionFromAPI,
): ActiveFocusSession {
  return { ...session };
}

export function mapActiveFocusSessionToAPI(
  session: ActiveFocusSession,
): ActiveFocusSessionFromAPI {
  return { ...session };
}

export function mapActiveGoalFromAPI(goal: ActiveGoalFromAPI): ActiveGoal {
  return { ...goal };
}

export function mapActiveGoalToAPI(goal: ActiveGoal): ActiveGoalFromAPI {
  return { ...goal };
}

export function mapTodayDashboardFromAPI(
  dashboard: TodayDashboardFromAPI,
): TodayDashboard {
  return {
    ...dashboard,
    activeFocusSession: dashboard.activeFocusSession
      ? mapActiveFocusSessionFromAPI(dashboard.activeFocusSession)
      : null,
    activeGoals: dashboard.activeGoals.map(mapActiveGoalFromAPI),
    focusSummary: mapFocusSummaryFromAPI(dashboard.focusSummary),
    scheduledHabits: dashboard.scheduledHabits.map(mapTodayHabitFromAPI),
    tasks: dashboard.tasks.map(mapTodayTaskFromAPI),
  };
}

export function mapTodayDashboardToAPI(
  dashboard: TodayDashboard,
): TodayDashboardFromAPI {
  return {
    ...dashboard,
    activeFocusSession: dashboard.activeFocusSession
      ? mapActiveFocusSessionToAPI(dashboard.activeFocusSession)
      : null,
    activeGoals: dashboard.activeGoals.map(mapActiveGoalToAPI),
    focusSummary: mapFocusSummaryToAPI(dashboard.focusSummary),
    scheduledHabits: dashboard.scheduledHabits.map(mapTodayHabitToAPI),
    tasks: dashboard.tasks.map(mapTodayTaskToAPI),
  };
}
