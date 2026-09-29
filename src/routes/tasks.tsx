import { createFileRoute } from '@tanstack/react-router'
import { TasksPage } from '@/features/tasks/pages/TasksPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
  errorComponent: RouteError,
})
