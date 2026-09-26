import { HttpResponse, http } from 'msw'
import { tasksMock } from '@/features/tasks/api/tasks.mock'
import { todayDashboardMock } from '@/features/today/api/today.mock'
import {
  createQuickNoteInputSchema,
  startFocusSessionInputSchema,
  updateFocusSessionInputSchema,
  updateHabitCheckInInputSchema,
} from '@/features/today/schemas/today.schemas'

function getActiveSessionElapsedSeconds() {
  const session = todayDashboardMock.activeFocusSession

  if (session?.status !== 'running' || !session.startedAt) {
    return session?.elapsedSeconds ?? 0
  }

  return (
    session.elapsedSeconds +
    Math.max(
      0,
      Math.floor((Date.now() - Date.parse(session.startedAt)) / 1_000),
    )
  )
}

export const todayHandlers = [
  http.get('/api/dashboard/today', () =>
    HttpResponse.json({ ...todayDashboardMock, tasks: tasksMock }),
  ),
  http.post('/api/habits/:habitId/check-ins', async ({ params, request }) => {
    const input = updateHabitCheckInInputSchema.safeParse(await request.json())
    const habit = todayDashboardMock.scheduledHabits.find(
      (item) => item.id === params.habitId,
    )

    if (!habit) {
      return HttpResponse.json({ message: 'Habit not found' }, { status: 404 })
    }

    if (!input.success || input.data.date !== todayDashboardMock.date) {
      return HttpResponse.json(
        { message: 'Invalid habit check-in' },
        { status: 422 },
      )
    }

    if (input.data.action === 'increment' && habit.targetCount) {
      const currentCount = Math.min(
        habit.targetCount,
        (habit.currentCount ?? 0) + 1,
      )
      habit.currentCount = currentCount
      habit.completed = currentCount === habit.targetCount
    } else {
      habit.completed = true
    }

    return HttpResponse.json(habit)
  }),
  http.post('/api/focus-sessions', async ({ request }) => {
    const input = startFocusSessionInputSchema.safeParse(await request.json())

    if (!input.success) {
      return HttpResponse.json(
        { message: 'Invalid focus session input' },
        { status: 422 },
      )
    }
    if (todayDashboardMock.activeFocusSession) {
      return HttpResponse.json(
        { message: 'A focus session is already active' },
        { status: 409 },
      )
    }

    const session = {
      elapsedSeconds: 0,
      id: `focus-${crypto.randomUUID()}`,
      startedAt: new Date().toISOString(),
      status: 'running' as const,
      taskTitle: input.data.taskTitle,
    }
    todayDashboardMock.activeFocusSession = session

    return HttpResponse.json(session, { status: 201 })
  }),
  http.patch('/api/focus-sessions/:sessionId', async ({ params, request }) => {
    const input = updateFocusSessionInputSchema.safeParse(await request.json())
    const session = todayDashboardMock.activeFocusSession

    if (!session || session.id !== params.sessionId) {
      return HttpResponse.json(
        { message: 'Focus session not found' },
        { status: 404 },
      )
    }

    if (!input.success) {
      return HttpResponse.json(
        { message: 'Invalid focus session update' },
        { status: 422 },
      )
    }

    session.elapsedSeconds = Math.max(
      input.data.elapsedSeconds,
      getActiveSessionElapsedSeconds(),
    )
    session.status = input.data.status
    session.startedAt =
      input.data.status === 'running' ? new Date().toISOString() : undefined

    return HttpResponse.json(session)
  }),
  http.post('/api/notes', async ({ request }) => {
    const input = createQuickNoteInputSchema.safeParse(await request.json())

    if (!input.success) {
      return HttpResponse.json(
        { message: 'Invalid note input' },
        { status: 422 },
      )
    }

    return HttpResponse.json(
      {
        content: input.data.content,
        createdAt: new Date().toISOString(),
        id: crypto.randomUUID(),
      },
      { status: 201 },
    )
  }),
]
