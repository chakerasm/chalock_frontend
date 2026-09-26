import { describe, expect, it } from "vitest";
import type { Habit, HabitLog } from "../types/habits.types";
import { getHabitStreak, isHabitLogCompleted } from "./habit-calendar.service";

const weekdayHabit: Habit = {
  createdAt: "2026-09-01T00:00:00.000Z",
  id: "gym",
  name: "Gym",
  schedule: { type: "weekdays", weekdays: [1, 3, 5] },
  state: "active",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

function log(date: string, progress = 1): HabitLog {
  return {
    completed: true,
    createdAt: `${date}T20:00:00.000Z`,
    date,
    habitId: "gym",
    progress,
    timeZone: "America/New_York",
    updatedAt: `${date}T20:00:00.000Z`,
  };
}

describe("getHabitStreak", () => {
  it("does not break a weekday streak on unscheduled days", () => {
    expect(
      getHabitStreak(
        weekdayHabit,
        [log("2026-09-21"), log("2026-09-23")],
        "2026-09-23",
      ),
    ).toBe(2);
  });

  it("keeps the previous weekday streak intact while today is still pending", () => {
    expect(
      getHabitStreak(weekdayHabit, [log("2026-09-21")], "2026-09-23"),
    ).toBe(1);
  });

  it("counts consecutive successful weeks for a weekly target", () => {
    const habit: Habit = {
      ...weekdayHabit,
      schedule: { type: "weekly-target" },
      targetCount: 3,
    };
    const logs = [
      log("2026-09-07"),
      log("2026-09-08"),
      log("2026-09-09"),
      log("2026-09-14"),
      log("2026-09-15"),
      log("2026-09-16"),
    ];

    expect(getHabitStreak(habit, logs, "2026-09-24")).toBe(2);
  });

  it("marks only the log that reaches the weekly target as complete", () => {
    const habit: Habit = {
      ...weekdayHabit,
      schedule: { type: "weekly-target" },
      targetCount: 3,
    };
    const logs = [log("2026-09-21"), log("2026-09-22")];

    expect(isHabitLogCompleted(habit, "2026-09-23", 1, logs)).toBe(true);
    expect(isHabitLogCompleted(habit, "2026-09-23", 0, logs)).toBe(false);
  });
});
