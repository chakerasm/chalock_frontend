import { createFileRoute } from '@tanstack/react-router'
import { PomodoroPage } from '@/features/focus/pages/PomodoroPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/focus/pomodoro')({
  component: PomodoroPage,
  errorComponent: RouteError,
})
