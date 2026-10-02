import { afterEach, describe, expect, it, vi } from 'vitest'
import { createGoalFromAPI } from '@/features/goals/api/goals.api'
import { createGoalInputSchema } from '@/features/goals/schemas/goals.schemas'

const taskBasedGoal = {
  createdAt: '2026-10-01T09:00:00.000Z',
  id: 'goal-1',
  progress: 0,
  progressStrategy: { mode: 'task-based' },
  status: 'active',
  title: 'Ship privacy mode',
  updatedAt: '2026-10-01T09:00:00.000Z',
}

describe('goals API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('omits progress when creating a task-based goal', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(taskBasedGoal), { status: 200 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await createGoalFromAPI({
      progressStrategy: { mode: 'task-based' },
      title: taskBasedGoal.title,
    })

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(JSON.parse(String(request.body))).toEqual({
      progressStrategy: { mode: 'task-based' },
      title: taskBasedGoal.title,
    })
  })

  it('strips stray progress from a task-based payload before serialization', () => {
    const parsed = createGoalInputSchema.parse({
      ...taskBasedGoal,
      progressStrategy: { mode: 'task-based' },
    })

    expect(parsed).not.toHaveProperty('progress')
  })
})
