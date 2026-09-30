import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, subscribeToUnauthorized } from '@/lib/api/client'

describe('unauthorized API handling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('notifies the centralized session handler on a 401 response', async () => {
    const onUnauthorized = vi.fn()
    const unsubscribe = subscribeToUnauthorized(onUnauthorized)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    )

    await expect(apiFetch('/api/private')).rejects.toMatchObject({
      status: 401,
    })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    unsubscribe()
  })
})
