import { createFileRoute } from '@tanstack/react-router'
import { PomodoroPage } from '@/features/focus/pages/PomodoroPage'

export const Route = createFileRoute('/focus/pomodoro')({
  component: PomodoroPage,
})
