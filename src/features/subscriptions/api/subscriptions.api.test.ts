import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSubscriptionsFromAPI } from '@/features/subscriptions/api/subscriptions.api'

describe('subscriptions API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the backend collection URL and forwards list filters', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      getSubscriptionsFromAPI({ status: 'active' }),
    ).resolves.toEqual([])

    expect(fetchMock.mock.calls[0]?.[0]).toMatch(
      /\/api\/v1\/subscriptions\?status=active$/,
    )
  })
})
