import { describe, expect, it } from "vitest";
import type { FocusTimerSnapshot } from "@/features/focus/types/focus.types";
import type { Goal } from "@/features/goals/types/goals.types";
import type { Task } from "@/features/tasks/types/tasks.types";
import {
  getGoalFocusSummary,
  getGoalProgressSummary,
} from "./goal-progress.service";

const goal: Goal = {
  createdAt: "2026-09-01T00:00:00.000Z",
  id: "goal-1",
  progress: 72,
  progressStrategy: { mode: "manual" },
  status: "active",
  title: "Pass GH-300",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

function makeTask(id: string, status: Task["status"], goalId = goal.id): Task {
  return {
    createdAt: "2026-09-01T00:00:00.000Z",
    goalId,
    id,
    priority: "medium",
    status,
    title: id,
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
}

describe("goal derived summaries", () => {
  it("keeps manual progress independent from task completion", () => {
    expect(
      getGoalProgressSummary(goal, [makeTask("task-1", "completed")]),
    ).toEqual({
      completedTasks: 0,
      isAvailable: true,
      progress: 72,
      totalTasks: 0,
    });
  });

  it("calculates task-based progress from completed linked tasks", () => {
    const taskGoal = {
      ...goal,
      progressStrategy: { mode: "task-based" as const },
    };
    expect(
      getGoalProgressSummary(taskGoal, [
        makeTask("task-1", "completed"),
        makeTask("task-2", "in_progress"),
        makeTask("task-3", "completed", "other-goal"),
      ]),
    ).toEqual({
      completedTasks: 1,
      isAvailable: true,
      progress: 50,
      totalTasks: 2,
    });
  });

  it("defines zero linked task progress as zero percent", () => {
    const taskGoal = {
      ...goal,
      progress: 100,
      progressStrategy: { mode: "task-based" as const },
    };
    expect(getGoalProgressSummary(taskGoal, [])).toEqual({
      completedTasks: 0,
      isAvailable: true,
      progress: 0,
      totalTasks: 0,
    });
  });

  it("uses API progress when task data is unavailable", () => {
    const taskGoal = {
      ...goal,
      progressStrategy: { mode: "task-based" as const },
    };
    expect(getGoalProgressSummary(taskGoal, [], false)).toEqual({
      completedTasks: 0,
      isAvailable: false,
      progress: 72,
      totalTasks: 0,
    });
  });

  it("sums only completed timer and Pomodoro history associated with the goal", () => {
    const snapshot = {
      activePomodoro: null,
      activeTimer: null,
      pomodoroHistory: [
        {
          completionState: "completed" as const,
          durationSeconds: 1_500,
          endedAt: "2026-09-01T01:00:00.000Z",
          goalId: goal.id,
          id: "pomo-1",
        },
        {
          completionState: "skipped" as const,
          durationSeconds: 500,
          endedAt: "2026-09-01T01:00:00.000Z",
          goalId: goal.id,
          id: "pomo-2",
        },
      ],
      savedSessions: [
        {
          durationSeconds: 600,
          goalId: goal.id,
          id: "timer-1",
          status: "completed" as const,
          type: "stopwatch" as const,
        },
      ],
    } satisfies FocusTimerSnapshot;

    expect(getGoalFocusSummary(goal.id, snapshot)).toEqual({
      sessionCount: 2,
      totalSeconds: 2_100,
    });
  });
});
