export type HabitWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type HabitSchedule =
  | { type: "daily" }
  | { type: "weekdays"; weekdays: HabitWeekday[] }
  | { type: "weekly-target" };

export type HabitState = "active" | "archived";

export type HabitFromAPI = {
  createdAt: string;
  description?: string;
  id: string;
  name: string;
  schedule: HabitSchedule;
  state: HabitState;
  targetCount?: number;
  unit?: string;
  updatedAt: string;
};

export type Habit = HabitFromAPI;

export type HabitLogFromAPI = {
  completed: boolean;
  createdAt: string;
  date: string;
  habitId: string;
  progress: number;
  timeZone: string;
  updatedAt: string;
};

export type HabitLog = HabitLogFromAPI;

export type CreateHabitInput = {
  description?: string;
  name: string;
  schedule: HabitSchedule;
  targetCount?: number;
  unit?: string;
};

export type UpdateHabitInput = Partial<CreateHabitInput> & { habitId: string };

export type WriteHabitLogInput = Omit<
  HabitLog,
  "completed" | "createdAt" | "date" | "habitId" | "updatedAt"
>;

export type HabitListFilter = { state?: HabitState };
