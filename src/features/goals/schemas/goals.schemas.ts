import { z } from "zod";

export const goalStatusSchema = z.enum([
  "active",
  "paused",
  "completed",
  "archived",
]);

export const goalProgressStrategySchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("manual") }),
  z.object({ mode: z.literal("task-based") }),
]);

const goalInputSchema = z.object({
  description: z.string().trim().min(1).max(2_000).optional(),
  progress: z.number().int().min(0).max(100),
  progressStrategy: goalProgressStrategySchema,
  targetDate: z.string().date().optional(),
  title: z.string().trim().min(1).max(120),
});

export const goalFromAPISchema = goalInputSchema.extend({
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  id: z.string().min(1),
  status: goalStatusSchema,
  updatedAt: z.string().datetime(),
});

export const goalsFromAPISchema = z.array(goalFromAPISchema);

export const createGoalInputSchema = goalInputSchema;
export const updateGoalInputSchema = goalInputSchema.partial().extend({
  status: goalStatusSchema.optional(),
});

export const goalFormSchema = z.object({
  description: z.string().max(2_000),
  progress: z.number().int().min(0).max(100),
  progressMode: z.enum(["manual", "task-based"]),
  targetDate: z.union([z.literal(""), z.string().date()]),
  title: z.string().trim().min(1).max(120),
});
