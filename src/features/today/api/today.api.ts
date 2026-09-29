import {
  activeFocusSessionFromAPISchema,
  createTodayTaskInputSchema,
  startFocusSessionInputSchema,
  todayDashboardFromAPISchema,
  todayTaskFromAPISchema,
  updateFocusSessionInputSchema,
  updateTodayTaskInputSchema,
} from "@/features/today/schemas/today.schemas";
import type {
  ActiveFocusSessionFromAPI,
  CreateTodayTaskInput,
  StartFocusSessionInput,
  TodayDashboardFromAPI,
  TodayTaskFromAPI,
  UpdateFocusSessionInput,
  UpdateHabitCheckInInput,
  UpdateTodayTaskInput,
} from "@/features/today/types/today.types";
import { apiFetch } from "@/lib/api/client";

const todayDashboardEndpoint = "/api/dashboard/today";

function getLocalDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

async function parseResponse<T>(
  response: Response,
  schema: { parse: (data: unknown) => T },
  errorMessage: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return schema.parse(await response.json());
}

export async function getTodayDashboardFromAPI(): Promise<TodayDashboardFromAPI> {
  return parseResponse(
    await apiFetch(todayDashboardEndpoint),
    todayDashboardFromAPISchema,
    "Unable to load today’s dashboard.",
  );
}

export async function createTodayTaskFromAPI(
  input: CreateTodayTaskInput,
): Promise<TodayTaskFromAPI> {
  const request = createTodayTaskInputSchema.parse(input);

  return parseResponse(
    await apiFetch("/api/tasks", {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
    todayTaskFromAPISchema,
    "Unable to add the task.",
  );
}

export async function updateTodayTaskFromAPI({
  completed,
  taskId,
}: UpdateTodayTaskInput): Promise<TodayTaskFromAPI> {
  const request = updateTodayTaskInputSchema.parse({
    status: completed ? "completed" : "todo",
  });

  return parseResponse(
    await apiFetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    }),
    todayTaskFromAPISchema,
    "Unable to update the task.",
  );
}

export async function updateHabitCheckInFromAPI({
  action,
  currentDayCount = 0,
  currentCount = currentDayCount,
  habitId,
  isWeeklyTarget = false,
  targetCount,
}: UpdateHabitCheckInInput) {
  const date = getLocalDate();
  const progress =
    action === "complete"
      ? isWeeklyTarget
        ? currentDayCount + Math.max(0, (targetCount ?? 1) - currentCount)
        : (targetCount ?? 1)
      : action === "increment"
        ? currentDayCount + 1
        : Math.max(0, currentDayCount - 1);
  const request = {
    progress,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  const response = await apiFetch(
    `/api/habits/${encodeURIComponent(habitId)}/logs/${date}`,
    {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to update the habit.");
  }
  return response.json();
}

export async function startFocusSessionFromAPI(
  input: StartFocusSessionInput = {},
): Promise<ActiveFocusSessionFromAPI> {
  const request = startFocusSessionInputSchema.parse(input);

  return parseResponse(
    await apiFetch("/api/focus-sessions", {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
    activeFocusSessionFromAPISchema,
    "Unable to start a focus session.",
  );
}

export async function updateFocusSessionFromAPI({
  elapsedSeconds,
  sessionId,
  status,
}: UpdateFocusSessionInput): Promise<ActiveFocusSessionFromAPI> {
  const request = updateFocusSessionInputSchema.parse({
    elapsedSeconds,
    status,
  });

  return parseResponse(
    await apiFetch(`/api/focus-sessions/${encodeURIComponent(sessionId)}`, {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    }),
    activeFocusSessionFromAPISchema,
    "Unable to update the focus session.",
  );
}
