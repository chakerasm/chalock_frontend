import {
  createGoalInputSchema,
  goalFromAPISchema,
  goalsFromAPISchema,
  updateGoalInputSchema,
} from "@/features/goals/schemas/goals.schemas";
import type {
  CreateGoalInput,
  GoalListFilter,
  UpdateGoalInput,
} from "@/features/goals/types/goals.types";
import { apiFetch } from "@/lib/api/client";

async function parseResponse<T>(
  response: Response,
  schema: { parse: (data: unknown) => T },
  errorMessage: string,
): Promise<T> {
  if (!response.ok) throw new Error(errorMessage);
  return schema.parse(await response.json());
}

export async function getGoalsFromAPI(filters: GoalListFilter = {}) {
  const query = filters.status
    ? `?${new URLSearchParams({ status: filters.status })}`
    : "";
  return parseResponse(
    await apiFetch(`/api/goals${query}`),
    goalsFromAPISchema,
    "Unable to load goals.",
  );
}

export async function getGoalFromAPI(goalId: string) {
  return parseResponse(
    await apiFetch(`/api/goals/${encodeURIComponent(goalId)}`),
    goalFromAPISchema,
    "Unable to load this goal.",
  );
}

export async function createGoalFromAPI(input: CreateGoalInput) {
  const request = createGoalInputSchema.parse(input);
  return parseResponse(
    await apiFetch("/api/goals", {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
    goalFromAPISchema,
    "Unable to create the goal.",
  );
}

export async function updateGoalFromAPI({ goalId, ...input }: UpdateGoalInput) {
  const request = updateGoalInputSchema.parse(input);
  return parseResponse(
    await apiFetch(`/api/goals/${encodeURIComponent(goalId)}`, {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    }),
    goalFromAPISchema,
    "Unable to update the goal.",
  );
}

export async function archiveGoalFromAPI(goalId: string) {
  return parseResponse(
    await apiFetch(`/api/goals/${encodeURIComponent(goalId)}/archive`, {
      method: "DELETE",
    }),
    goalFromAPISchema,
    "Unable to archive the goal.",
  );
}
