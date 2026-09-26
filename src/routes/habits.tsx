import { createFileRoute } from "@tanstack/react-router";
import { HabitsPage } from "@/features/habits/pages/HabitsPage";

export const Route = createFileRoute("/habits")({ component: HabitsPage });
