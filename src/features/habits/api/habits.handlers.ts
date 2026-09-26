import { HttpResponse, http } from 'msw'
import {
  habitLogsMock,
  habitsMock,
  upsertHabitLog,
} from '@/features/habits/api/habits.mock'
import {
  createHabitInputSchema,
  updateHabitInputSchema,
  writeHabitLogInputSchema,
} from '@/features/habits/schemas/habits.schemas'
import { getLocalDate } from '@/features/habits/services/habit-calendar.service'

function findHabit(habitId: string) {
  return habitsMock.find((habit) => habit.id === habitId)
}

function getLogs(habitId: string | undefined, request: Request) {
  const url = new URL(request.url)
  const from = url.searchParams.get('from') ?? ''
  const to = url.searchParams.get('to') ?? ''
  return habitLogsMock.filter(
    (log) =>
      (!habitId || log.habitId === habitId) &&
      (!from || log.date >= from) &&
      (!to || log.date <= to),
  )
}

export const habitHandlers = [
  http.get('/api/habits', ({ request }) => {
    const state = new URL(request.url).searchParams.get('state')
    return HttpResponse.json(
      habitsMock.filter((habit) => !state || habit.state === state),
    )
  }),
  http.post('/api/habits', async ({ request }) => {
    const input = createHabitInputSchema.safeParse(await request.json())
    if (!input.success) {
      return HttpResponse.json(
        { code: 'INVALID_HABIT', message: 'Habit input is invalid.' },
        { status: 422 },
      )
    }
    const now = new Date().toISOString()
    const habit = {
      ...input.data,
      createdAt: now,
      id: `habit-${crypto.randomUUID()}`,
      state: 'active' as const,
      updatedAt: now,
    }
    habitsMock.unshift(habit)
    return HttpResponse.json(habit, { status: 201 })
  }),
  http.patch('/api/habits/:habitId', async ({ params, request }) => {
    const habit = findHabit(String(params.habitId))
    if (!habit) {
      return HttpResponse.json(
        { code: 'HABIT_NOT_FOUND', message: 'Habit not found.' },
        { status: 404 },
      )
    }
    const input = updateHabitInputSchema.safeParse(await request.json())
    if (!input.success) {
      return HttpResponse.json(
        { code: 'INVALID_HABIT', message: 'Habit update is invalid.' },
        { status: 422 },
      )
    }
    const updated = { ...habit, ...input.data }
    if (updated.schedule.type === 'weekly-target' && !updated.targetCount) {
      return HttpResponse.json(
        { code: 'INVALID_HABIT_TARGET', message: 'Weekly target is required.' },
        { status: 422 },
      )
    }
    Object.assign(habit, input.data, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(habit)
  }),
  http.post('/api/habits/:habitId/archive', ({ params }) => {
    const habit = findHabit(String(params.habitId))
    if (!habit) {
      return HttpResponse.json(
        { code: 'HABIT_NOT_FOUND', message: 'Habit not found.' },
        { status: 404 },
      )
    }
    habit.state = 'archived'
    habit.updatedAt = new Date().toISOString()
    return HttpResponse.json(habit)
  }),
  http.get('/api/habits/:habitId/logs', ({ params, request }) => {
    if (!findHabit(String(params.habitId))) {
      return HttpResponse.json(
        { code: 'HABIT_NOT_FOUND', message: 'Habit not found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json(getLogs(String(params.habitId), request))
  }),
  http.get('/api/habit-logs', ({ request }) =>
    HttpResponse.json(getLogs(undefined, request)),
  ),
  http.put('/api/habits/:habitId/logs/:date', async ({ params, request }) => {
    const habitId = String(params.habitId)
    const date = String(params.date)
    const habit = findHabit(habitId)
    if (!habit || habit.state === 'archived') {
      return HttpResponse.json(
        { code: 'HABIT_NOT_FOUND', message: 'Active habit not found.' },
        { status: 404 },
      )
    }
    const parsedDate = new Date(`${date}T12:00:00`)
    const dateIsValid =
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      !Number.isNaN(parsedDate.getTime()) &&
      getLocalDate(parsedDate) === date
    const input = writeHabitLogInputSchema.safeParse(await request.json())
    if (!dateIsValid || !input.success) {
      return HttpResponse.json(
        { code: 'INVALID_HABIT_LOG', message: 'Habit log input is invalid.' },
        { status: 422 },
      )
    }
    const log = upsertHabitLog(
      habitId,
      date,
      input.data.progress,
      input.data.timeZone,
    )
    return HttpResponse.json(log)
  }),
]
