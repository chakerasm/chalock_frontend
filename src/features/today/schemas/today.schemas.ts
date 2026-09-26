import { z } from "zod";

const todayTaskPrioritySchema = z.enum(["high", "medium", "low"]);
const todayTaskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "completed",
  "cancelled",
]);

export const todayTaskFromAPISchema = z.object({
  dueTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  id: z.string().min(1),
  priority: todayTaskPrioritySchema.optional(),
  status: todayTaskStatusSchema,
  title: z.string().min(1),
});

export const todayHabitFromAPISchema = z.object({
  completed: z.boolean(),
  currentCount: z.number().int().nonnegative().optional(),
  currentDayCount: z.number().int().nonnegative().optional(),
  id: z.string().min(1),
  isWeeklyTarget: z.boolean().optional(),
  name: z.string().min(1),
  targetCount: z.number().int().positive().optional(),
});

export const focusSummaryFromAPISchema = z.object({
  completedMinutes: z.number().int().nonnegative(),
  completedSessions: z.number().int().nonnegative(),
});

export const activeFocusSessionFromAPISchema = z.object({
  elapsedSeconds: z.number().int().nonnegative(),
  id: z.string().min(1),
  startedAt: z.string().datetime().optional(),
  status: z.enum(["active", "paused"]),
  taskTitle: z.string().min(1).optional(),
});

export const activeGoalFromAPISchema = z.object({
  currentValue: z.number().nonnegative(),
  id: z.string().min(1),
  name: z.string().min(1),
  targetDate: z.string().date().optional(),
  targetValue: z.number().positive(),
});

export const todayDashboardFromAPISchema = z.object({
  activeFocusSession: activeFocusSessionFromAPISchema.nullable(),
  activeGoals: z.array(activeGoalFromAPISchema),
  date: z.string().date(),
  focusSummary: focusSummaryFromAPISchema,
  scheduledHabits: z.array(todayHabitFromAPISchema),
  tasks: z.array(todayTaskFromAPISchema),
});

export const createTodayTaskInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export const updateTodayTaskInputSchema = z.object({
  status: todayTaskStatusSchema,
});

export const updateFocusSessionInputSchema = z.object({
  elapsedSeconds: z.number().int().nonnegative(),
  status: z.enum(["active", "paused"]),
});

export const startFocusSessionInputSchema = z.object({
  taskTitle: z.string().trim().min(1).max(120).optional(),
});
