import { HttpResponse, http } from 'msw'
import { todayDashboardMock } from '@/features/today/api/today.mock'
import {
  createQuickNoteInputSchema,
  createTodayTaskInputSchema,
  updateFocusSessionInputSchema,
  updateHabitCheckInInputSchema,
  updateTodayTaskInputSchema,
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
  http.get('/api/dashboard/today', () => HttpResponse.json(todayDashboardMock)),
  http.post('/api/tasks', async ({ request }) => {
    const input = createTodayTaskInputSchema.safeParse(await request.json())

    if (!input.success) {
      return HttpResponse.json(
        { message: 'Invalid task input' },
        { status: 422 },
      )
    }

    const task = {
      completed: false,
      id: `task-${crypto.randomUUID()}`,
      title: input.data.title,
    }
    todayDashboardMock.tasks.unshift(task)

    return HttpResponse.json(task, { status: 201 })
  }),
  http.patch('/api/tasks/:taskId', async ({ params, request }) => {
    const input = updateTodayTaskInputSchema.safeParse(await request.json())
    const task = todayDashboardMock.tasks.find(
      (item) => item.id === params.taskId,
    )

    if (!task) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    if (!input.success) {
      return HttpResponse.json(
        { message: 'Invalid task update' },
        { status: 422 },
      )
    }

    task.completed = input.data.completed
    return HttpResponse.json(task)
  }),
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
  http.post('/api/focus-sessions', () => {
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
