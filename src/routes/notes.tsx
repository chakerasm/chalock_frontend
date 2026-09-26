import { createFileRoute } from "@tanstack/react-router";
import { NotesPage } from "@/features/notes/pages/NotesPage";

export const Route = createFileRoute("/notes")({ component: NotesPage });
