import { createFileRoute } from '@tanstack/react-router'
import { NotesPage } from '@/features/notes/pages/NotesPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/notes')({
  component: NotesPage,
  errorComponent: RouteError,
})
