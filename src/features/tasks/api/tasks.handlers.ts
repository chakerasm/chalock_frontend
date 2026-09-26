import { HttpResponse, http } from "msw";
import {
  findGoal,
  updateGoalProgressFromTasks,
} from "@/features/goals/api/goals.mock";
import { tasksMock } from "@/features/tasks/api/tasks.mock";
import {
  createTaskInputSchema,
  updateTaskInputSchema,
} from "@/features/tasks/schemas/tasks.schemas";
import type { TaskFromAPI } from "@/features/tasks/types/tasks.types";

function applyFilters(tasks: TaskFromAPI[], request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const dueFrom = url.searchParams.get("dueFrom");
  const dueTo = url.searchParams.get("dueTo");
  const goalId = url.searchParams.get("goalId");
  const search = url.searchParams.get("search")?.trim().toLocaleLowerCase();

  return tasks.filter((task) => {
    if (status && task.status !== status) return false;
    if (priority && task.priority !== priority) return false;
    if (goalId && task.goalId !== goalId) return false;
    if (dueFrom && (!task.dueDate || task.dueDate < dueFrom)) return false;
    if (dueTo && (!task.dueDate || task.dueDate > dueTo)) return false;
    if (
      search &&
      !`${task.title} ${task.description ?? ""}`
        .toLocaleLowerCase()
        .includes(search)
    ) {
      return false;
    }
    return true;
  });
}

function findTask(taskId: string) {
  return tasksMock.find((task) => task.id === taskId);
}

export const taskHandlers = [
  http.get("/api/tasks", ({ request }) =>
    HttpResponse.json({
      data: applyFilters(tasksMock, request),
      nextCursor: null,
    }),
  ),
  http.get("/api/tasks/:taskId", ({ params }) => {
    const task = findTask(String(params.taskId));
    if (!task) {
      return HttpResponse.json(
        { code: "TASK_NOT_FOUND", message: "Task not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json(task);
  }),
  http.post("/api/tasks", async ({ request }) => {
    const input = createTaskInputSchema.safeParse(await request.json());
    if (!input.success) {
      return HttpResponse.json(
        { code: "TASK_TITLE_REQUIRED", message: "Task input is invalid" },
        { status: 422 },
      );
    }
    if (input.data.goalId && !findGoal(input.data.goalId)) {
      return HttpResponse.json(
        { code: "GOAL_ACCESS_DENIED", message: "Goal is unavailable." },
        { status: 403 },
      );
    }

    const timestamp = new Date().toISOString();
    const task: TaskFromAPI = {
      ...input.data,
      createdAt: timestamp,
      id: `task-${crypto.randomUUID()}`,
      priority: input.data.priority ?? "medium",
      status: "todo",
      updatedAt: timestamp,
    };
    tasksMock.unshift(task);
    return HttpResponse.json(task, { status: 201 });
  }),
  http.patch("/api/tasks/:taskId", async ({ params, request }) => {
    const input = updateTaskInputSchema.safeParse(await request.json());
    const task = findTask(String(params.taskId));

    if (!task) {
      return HttpResponse.json(
        { code: "TASK_NOT_FOUND", message: "Task not found" },
        { status: 404 },
      );
    }
    if (!input.success) {
      return HttpResponse.json(
        { code: "INVALID_TASK_STATUS", message: "Task update is invalid" },
        { status: 422 },
      );
    }
    if (input.data.goalId && !findGoal(input.data.goalId)) {
      return HttpResponse.json(
        { code: "GOAL_ACCESS_DENIED", message: "Goal is unavailable." },
        { status: 403 },
      );
    }

    const previousGoalId = task.goalId;
    const { goalId, ...fields } = input.data;
    Object.assign(task, fields);
    if (goalId !== undefined) task.goalId = goalId ?? undefined;
    if (goalId !== undefined) {
      if (previousGoalId) {
        updateGoalProgressFromTasks(previousGoalId);
      }
      if (goalId) {
        updateGoalProgressFromTasks(goalId);
      }
    }
    if (input.data.status === "completed") {
      task.completedAt = new Date().toISOString();
    }
    if (input.data.status && input.data.status !== "completed") {
      task.completedAt = undefined;
    }
    task.updatedAt = new Date().toISOString();
    return HttpResponse.json(task);
  }),
  http.delete("/api/tasks/:taskId", ({ params }) => {
    const index = tasksMock.findIndex((task) => task.id === params.taskId);
    if (index === -1) {
      return HttpResponse.json(
        { code: "TASK_NOT_FOUND", message: "Task not found" },
        { status: 404 },
      );
    }
    tasksMock.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
