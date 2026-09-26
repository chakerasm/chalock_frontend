import { createFileRoute } from '@tanstack/react-router'
import { FocusPage } from '@/features/focus/pages/FocusPage'

export const Route = createFileRoute('/focus')({
  component: FocusPage,
})
