import type {
  CreateGoalInput,
  Goal,
  GoalFromAPI,
} from "@/features/goals/types/goals.types";

export function mapGoalFromAPI(goal: GoalFromAPI): Goal {
  return { ...goal, progressStrategy: { ...goal.progressStrategy } };
}

export function mapGoalToAPI(goal: CreateGoalInput): CreateGoalInput {
  return { ...goal, progressStrategy: { ...goal.progressStrategy } };
}
