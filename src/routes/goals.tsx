import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { GoalsPage } from "@/features/goals/pages/GoalsPage";

export const Route = createFileRoute("/goals")({
  validateSearch: z.object({ goalId: z.string().optional() }),
  component: GoalsPage,
});
