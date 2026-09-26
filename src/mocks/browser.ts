import { setupWorker } from "msw/browser";
import { goalHandlers } from "@/features/goals/api/goals.handlers";
import { habitHandlers } from "@/features/habits/api/habits.handlers";
import { noteHandlers } from "@/features/notes/api/notes.handlers";
import { taskHandlers } from "@/features/tasks/api/tasks.handlers";
import { todayHandlers } from "@/features/today/api/today.handlers";

export const worker = setupWorker(
  ...goalHandlers,
  ...habitHandlers,
  ...noteHandlers,
  ...taskHandlers,
  ...todayHandlers,
);
