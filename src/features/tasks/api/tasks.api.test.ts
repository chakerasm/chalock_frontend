import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createTaskFromAPI,
  deleteTaskFromAPI,
  getTasksFromAPI,
  updateTaskFromAPI,
} from '@/features/tasks/api/tasks.api'
import type { RecurrenceRule } from '@/lib/recurrence/recurrence.types'

const recurrence = {
  ends: 'never',
  frequency: 'monthly',
  interval: 1,
  startsOn: '2026-10-04',
  timezone: 'Africa/Casablanca',
  weekday: 0,
  weekOfMonth: 1,
} satisfies RecurrenceRule

const occurrence = {
  createdAt: '2026-10-04T08:00:00.000Z',
  dueDate: '2026-10-04',
  id: 'series_finances:2026-10-04',
  occurrenceDate: '2026-10-04',
  priority: 'medium',
  recurrence,
  seriesId: 'series_finances',
  status: 'todo',
  title: 'Review my finances',
  updatedAt: '2026-10-04T08:00:00.000Z',
}

const response = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 })

describe('Tasks API', () => {
  afterEach(() => vi.restoreAllMocks())

  it('requests the backend due-date range used by Today and Upcoming projections', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(response({ data: [occurrence] }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      getTasksFromAPI({ dueFrom: '2026-10-04', dueTo: '2026-10-10' }),
    ).resolves.toEqual([occurrence])

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/api\/v1\/tasks\?(?:dueFrom=2026-10-04&dueTo=2026-10-10|dueTo=2026-10-10&dueFrom=2026-10-04)$/,
      ),
      expect.any(Object),
    )
  })

  it('creates a series, completes one occurrence, and skips future occurrences', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(occurrence))
      .mockResolvedValueOnce(
        response({
          ...occurrence,
          completedAt: '2026-10-04T08:30:00.000Z',
          status: 'completed',
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await createTaskFromAPI({
      dueDate: '2026-10-04',
      recurrence: occurrence.recurrence,
      title: occurrence.title,
    })
    await updateTaskFromAPI({
      occurrenceDate: occurrence.occurrenceDate,
      scope: 'this',
      status: 'completed',
      taskId: occurrence.id,
      title: occurrence.title,
    })
    await deleteTaskFromAPI({
      occurrenceDate: occurrence.occurrenceDate,
      scope: 'future',
      taskId: occurrence.id,
    })

    const [createUrl, createInit] = fetchMock.mock.calls[0]
    expect(createUrl).toMatch(/\/api\/v1\/tasks$/)
    expect(JSON.parse(createInit.body)).toMatchObject({
      recurrence: { weekday: 0, weekOfMonth: 1 },
    })

    const [patchUrl, patchInit] = fetchMock.mock.calls[1]
    expect(patchUrl).toMatch(/series_finances%3A2026-10-04$/)
    expect(JSON.parse(patchInit.body)).toMatchObject({
      occurrenceDate: '2026-10-04',
      scope: 'this',
      status: 'completed',
    })
    expect(fetchMock.mock.calls[2][0]).toMatch(
      /scope=future&occurrenceDate=2026-10-04|occurrenceDate=2026-10-04&scope=future/,
    )
  })
})
