import { setupWorker } from "msw/browser";
import { exampleFutureHandlers } from "@/features/example-future/api/example-future.handlers";
import { goalHandlers } from "@/features/goals/api/goals.handlers";
import { habitHandlers } from "@/features/habits/api/habits.handlers";
import { taskHandlers } from "@/features/tasks/api/tasks.handlers";
import { todayHandlers } from "@/features/today/api/today.handlers";

export const worker = setupWorker(
  ...exampleFutureHandlers,
  ...goalHandlers,
  ...habitHandlers,
  ...taskHandlers,
  ...todayHandlers,
);
