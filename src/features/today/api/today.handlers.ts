import { HttpResponse, http } from "msw";
import {
  goalsMock,
  updateGoalProgressFromTasks,
} from "@/features/goals/api/goals.mock";
import { getTodayHabitProjection } from "@/features/habits/api/habits.mock";
import { tasksMock } from "@/features/tasks/api/tasks.mock";
import { todayDashboardMock } from "@/features/today/api/today.mock";
import {
  startFocusSessionInputSchema,
  updateFocusSessionInputSchema,
} from "@/features/today/schemas/today.schemas";

function getActiveSessionElapsedSeconds() {
  const session = todayDashboardMock.activeFocusSession;

  if (session?.status !== "active" || !session.startedAt) {
    return session?.elapsedSeconds ?? 0;
  }

  return (
    session.elapsedSeconds +
    Math.max(
      0,
      Math.floor((Date.now() - Date.parse(session.startedAt)) / 1_000),
    )
  );
}

export const todayHandlers = [
  http.get("/api/dashboard/today", () => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return HttpResponse.json({
      ...todayDashboardMock,
      activeGoals: goalsMock
        .filter((goal) => goal.status === "active")
        .map((goal) => updateGoalProgressFromTasks(goal.id) ?? goal)
        .slice(0, 4)
        .map((goal) => ({
          currentValue: goal.progress,
          id: goal.id,
          name: goal.title,
          targetDate: goal.targetDate,
          targetValue: 100,
        })),
      date,
      scheduledHabits: getTodayHabitProjection(date),
      tasks: tasksMock,
    });
  }),
  http.post("/api/focus-sessions", async ({ request }) => {
    const input = startFocusSessionInputSchema.safeParse(await request.json());

    if (!input.success) {
      return HttpResponse.json(
        { message: "Invalid focus session input" },
        { status: 422 },
      );
    }
    if (todayDashboardMock.activeFocusSession) {
      return HttpResponse.json(
        { message: "A focus session is already active" },
        { status: 409 },
      );
    }

    const session = {
      elapsedSeconds: 0,
      id: `focus-${crypto.randomUUID()}`,
      startedAt: new Date().toISOString(),
      status: "active" as const,
      taskTitle: input.data.taskTitle,
    };
    todayDashboardMock.activeFocusSession = session;

    return HttpResponse.json(session, { status: 201 });
  }),
  http.patch("/api/focus-sessions/:sessionId", async ({ params, request }) => {
    const input = updateFocusSessionInputSchema.safeParse(await request.json());
    const session = todayDashboardMock.activeFocusSession;

    if (!session || session.id !== params.sessionId) {
      return HttpResponse.json(
        { message: "Focus session not found" },
        { status: 404 },
      );
    }

    if (!input.success) {
      return HttpResponse.json(
        { message: "Invalid focus session update" },
        { status: 422 },
      );
    }

    session.elapsedSeconds = Math.max(
      input.data.elapsedSeconds,
      getActiveSessionElapsedSeconds(),
    );
    session.status = input.data.status;
    session.startedAt =
      input.data.status === "active" ? new Date().toISOString() : undefined;

    return HttpResponse.json(session);
  }),
];
