import { z } from "zod";

export const habitWeekdaySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

export const habitScheduleSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("daily") }),
  z.object({
    type: z.literal("weekdays"),
    weekdays: z
      .array(habitWeekdaySchema)
      .min(1)
      .refine((weekdays) => new Set(weekdays).size === weekdays.length),
  }),
  z.object({ type: z.literal("weekly-target") }),
]);

export const habitFromAPISchema = z.object({
  createdAt: z.string().datetime(),
  description: z.string().max(2_000).optional(),
  id: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  schedule: habitScheduleSchema,
  state: z.enum(["active", "archived"]),
  targetCount: z.number().int().positive().optional(),
  unit: z.string().trim().min(1).max(40).optional(),
  updatedAt: z.string().datetime(),
});

export const habitsFromAPISchema = z.array(habitFromAPISchema);

export const habitLogFromAPISchema = z.object({
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  date: z.string().date(),
  habitId: z.string().min(1),
  progress: z.number().int().nonnegative(),
  timeZone: z.string().min(1).max(100),
  updatedAt: z.string().datetime(),
});

export const habitLogsFromAPISchema = z.array(habitLogFromAPISchema);

const habitInputSchema = z.object({
  description: z.string().trim().min(1).max(2_000).optional(),
  name: z.string().trim().min(1).max(100),
  schedule: habitScheduleSchema,
  targetCount: z.number().int().positive().optional(),
  unit: z.string().trim().min(1).max(40).optional(),
});

export const createHabitInputSchema = habitInputSchema.refine(
  (input) =>
    input.schedule.type !== "weekly-target" || input.targetCount !== undefined,
  { message: "Weekly-target habits require a target count." },
);

export const updateHabitInputSchema = habitInputSchema.partial();

export const writeHabitLogInputSchema = z.object({
  progress: z.number().int().nonnegative(),
  timeZone: z.string().min(1).max(100),
});

export const habitFormSchema = createHabitInputSchema;
