import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createTimeBlockFromAPI,
  deleteTimeBlockFromAPI,
  getTimeBlocksFromAPI,
  updateTimeBlockFromAPI,
} from './planner.api'

const occurrence = {
  createdAt: '2026-10-12T08:00:00.000Z',
  date: '2026-10-12',
  endTime: '20:30',
  id: 'series_gym:2026-10-12',
  occurrenceDate: '2026-10-12',
  seriesId: 'series_gym',
  startTime: '19:30',
  status: 'planned',
  title: 'Gym',
  updatedAt: '2026-10-12T08:00:00.000Z',
}

const response = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 })

describe('Planner API', () => {
  afterEach(() => vi.restoreAllMocks())

  it('requests flattened occurrences with the documented date filter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response([occurrence]))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getTimeBlocksFromAPI('?date=2026-10-12')).resolves.toEqual([
      occurrence,
    ])

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/time-blocks\?date=2026-10-12$/),
      expect.any(Object),
    )
  })

  it('creates a series, patches one occurrence, and deletes future occurrences', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(occurrence))
      .mockResolvedValueOnce(response({ ...occurrence, title: 'Gym later' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await createTimeBlockFromAPI({
      date: '2026-10-12',
      endTime: '20:30',
      recurrence: {
        ends: 'never',
        frequency: 'weekly',
        interval: 1,
        startsOn: '2026-10-12',
        timezone: 'Africa/Casablanca',
        weekdays: [1, 3, 5],
      },
      startTime: '19:30',
      title: 'Gym',
    })
    await updateTimeBlockFromAPI({
      occurrenceDate: '2026-10-12',
      scope: 'this',
      timeBlockId: occurrence.id,
      title: 'Gym later',
    })
    await deleteTimeBlockFromAPI({
      occurrenceDate: '2026-10-12',
      scope: 'future',
      timeBlockId: occurrence.id,
    })

    const [createUrl, createInit] = fetchMock.mock.calls[0]
    expect(createUrl).toMatch(/\/api\/v1\/time-blocks$/)
    expect(JSON.parse(createInit.body)).toMatchObject({
      recurrence: { weekdays: [1, 3, 5] },
    })
    const [patchUrl, patchInit] = fetchMock.mock.calls[1]
    expect(patchUrl).toMatch(/\/api\/v1\/time-blocks\/series_gym%3A2026-10-12$/)
    expect(JSON.parse(patchInit.body)).toMatchObject({
      occurrenceDate: '2026-10-12',
      scope: 'this',
    })
    expect(fetchMock.mock.calls[2][0]).toMatch(
      /scope=future&occurrenceDate=2026-10-12|occurrenceDate=2026-10-12&scope=future/,
    )
  })
})
