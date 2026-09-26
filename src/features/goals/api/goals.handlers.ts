import { HttpResponse, http } from "msw";
import {
  findGoal,
  goalsMock,
  updateGoalProgressFromTasks,
} from "@/features/goals/api/goals.mock";
import {
  createGoalInputSchema,
  goalStatusSchema,
  updateGoalInputSchema,
} from "@/features/goals/schemas/goals.schemas";

export const goalHandlers = [
  http.get("/api/goals", ({ request }) => {
    const status = new URL(request.url).searchParams.get("status");
    const goals = goalsMock
      .filter((goal) => !status || goal.status === status)
      .map((goal) => updateGoalProgressFromTasks(goal.id) ?? goal);
    return HttpResponse.json(goals);
  }),
  http.get("/api/goals/:goalId", ({ params }) => {
    const goal = updateGoalProgressFromTasks(String(params.goalId));
    if (!goal) {
      return HttpResponse.json(
        { code: "GOAL_NOT_FOUND", message: "Goal not found." },
        { status: 404 },
      );
    }
    return HttpResponse.json(goal);
  }),
  http.post("/api/goals", async ({ request }) => {
    const input = createGoalInputSchema.safeParse(await request.json());
    if (!input.success) {
      return HttpResponse.json(
        { code: "INVALID_GOAL", message: "Goal input is invalid." },
        { status: 422 },
      );
    }
    const now = new Date().toISOString();
    const goal = {
      ...input.data,
      createdAt: now,
      id: `goal-${crypto.randomUUID()}`,
      status: "active" as const,
      updatedAt: now,
    };
    goalsMock.unshift(goal);
    return HttpResponse.json(goal, { status: 201 });
  }),
  http.patch("/api/goals/:goalId", async ({ params, request }) => {
    const goal = findGoal(String(params.goalId));
    if (!goal) {
      return HttpResponse.json(
        { code: "GOAL_NOT_FOUND", message: "Goal not found." },
        { status: 404 },
      );
    }
    const input = updateGoalInputSchema.safeParse(await request.json());
    if (!input.success) {
      return HttpResponse.json(
        { code: "INVALID_GOAL", message: "Goal update is invalid." },
        { status: 422 },
      );
    }
    const nextProgressStrategy =
      input.data.progressStrategy ?? goal.progressStrategy;
    if (
      nextProgressStrategy.mode === "task-based" &&
      input.data.progress !== undefined &&
      goal.progressStrategy.mode === "task-based"
    ) {
      return HttpResponse.json(
        {
          code: "DERIVED_GOAL_PROGRESS",
          message: "Task-based progress is derived.",
        },
        { status: 422 },
      );
    }
    if (
      input.data.status &&
      !goalStatusSchema.safeParse(input.data.status).success
    ) {
      return HttpResponse.json(
        { code: "INVALID_GOAL_STATUS", message: "Goal status is invalid." },
        { status: 422 },
      );
    }
    Object.assign(goal, input.data, { updatedAt: new Date().toISOString() });
    if (input.data.status === "completed") {
      goal.completedAt = new Date().toISOString();
    } else if (input.data.status) {
      goal.completedAt = undefined;
    }
    return HttpResponse.json(updateGoalProgressFromTasks(goal.id) ?? goal);
  }),
  http.delete("/api/goals/:goalId/archive", ({ params }) => {
    const goal = findGoal(String(params.goalId));
    if (!goal) {
      return HttpResponse.json(
        { code: "GOAL_NOT_FOUND", message: "Goal not found." },
        { status: 404 },
      );
    }
    goal.status = "archived";
    goal.updatedAt = new Date().toISOString();
    return HttpResponse.json(goal);
  }),
];
