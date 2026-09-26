import type { GoalFromAPI } from "@/features/goals/types/goals.types";
import { tasksMock } from "@/features/tasks/api/tasks.mock";

function timestamp(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

export const goalsMock: GoalFromAPI[] = [
  {
    createdAt: timestamp(40),
    description: "Pass the GH-300 certification exam.",
    id: "goal-gh300",
    progress: 50,
    progressStrategy: { mode: "task-based" },
    status: "active",
    targetDate: "2026-10-15",
    title: "Pass GH-300",
    updatedAt: timestamp(1),
  },
  {
    createdAt: timestamp(70),
    description: "Finish twelve books before the year ends.",
    id: "goal-1",
    progress: 58,
    progressStrategy: { mode: "manual" },
    status: "active",
    targetDate: "2026-12-31",
    title: "Read 12 books",
    updatedAt: timestamp(2),
  },
  {
    createdAt: timestamp(20),
    description: "Build a routine that fits an ordinary week.",
    id: "goal-2",
    progress: 60,
    progressStrategy: { mode: "manual" },
    status: "active",
    targetDate: "2026-11-01",
    title: "Go to the gym consistently",
    updatedAt: timestamp(1),
  },
  {
    createdAt: timestamp(55),
    description: "Complete the current product design course.",
    id: "goal-3",
    progress: 65,
    progressStrategy: { mode: "manual" },
    status: "active",
    targetDate: "2026-11-15",
    title: "Launch my next chapter",
    updatedAt: timestamp(3),
  },
  {
    createdAt: timestamp(12),
    description: "Make time for good conversations.",
    id: "goal-4",
    progress: 50,
    progressStrategy: { mode: "manual" },
    status: "paused",
    targetDate: "2026-12-01",
    title: "Host four community dinners",
    updatedAt: timestamp(8),
  },
];

for (const [id, title, status] of [
  ["gh300-task-1", "Review identity and access concepts", "completed"],
  ["gh300-task-2", "Complete a practice assessment", "todo"],
] as const) {
  if (!tasksMock.some((task) => task.id === id)) {
    const now = timestamp(3);
    tasksMock.push({
      completedAt: status === "completed" ? timestamp(1) : undefined,
      createdAt: now,
      goalId: "goal-gh300",
      id,
      priority: "medium",
      status,
      title,
      updatedAt: now,
    });
  }
}

export function findGoal(goalId: string) {
  return goalsMock.find((goal) => goal.id === goalId);
}

export function updateGoalProgressFromTasks(goalId: string) {
  const goal = findGoal(goalId);
  if (goal?.progressStrategy.mode !== "task-based") return goal;
  const linkedTasks = tasksMock.filter((task) => task.goalId === goal.id);
  const completedTasks = linkedTasks.filter(
    (task) => task.status === "completed",
  ).length;
  goal.progress = linkedTasks.length
    ? Math.round((completedTasks / linkedTasks.length) * 100)
    : 0;
  return goal;
}

export function updateTaskGoal(taskId: string, goalId: string | undefined) {
  const task = tasksMock.find((item) => item.id === taskId);
  if (!task) return undefined;
  const previousGoalId = task.goalId;
  task.goalId = goalId;
  if (previousGoalId) updateGoalProgressFromTasks(previousGoalId);
  if (goalId) updateGoalProgressFromTasks(goalId);
  return task;
}
