import {
  archiveGoalFromAPI,
  createGoalFromAPI,
  getGoalFromAPI,
  getGoalsFromAPI,
  updateGoalFromAPI,
} from "@/features/goals/api/goals.api";
import {
  mapGoalFromAPI,
  mapGoalToAPI,
} from "@/features/goals/mappers/goals.mapper";
import type {
  CreateGoalInput,
  GoalListFilter,
  UpdateGoalInput,
} from "@/features/goals/types/goals.types";

export async function getGoals(filters: GoalListFilter = {}) {
  return (await getGoalsFromAPI(filters)).map(mapGoalFromAPI);
}

export async function getGoal(goalId: string) {
  return mapGoalFromAPI(await getGoalFromAPI(goalId));
}

export async function createGoal(input: CreateGoalInput) {
  return mapGoalFromAPI(await createGoalFromAPI(mapGoalToAPI(input)));
}

export async function updateGoal(input: UpdateGoalInput) {
  return mapGoalFromAPI(await updateGoalFromAPI(input));
}

export async function archiveGoal(goalId: string) {
  return mapGoalFromAPI(await archiveGoalFromAPI(goalId));
}
