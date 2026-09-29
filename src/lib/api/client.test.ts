import { afterEach, describe, expect, it, vi } from 'vitest'
import { type ApiError, apiFetch } from './client'

describe('apiFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds JSON response headers and returns successful responses', async () => {
    const response = new Response(JSON.stringify({ ok: true }), { status: 200 })
    const fetchMock = vi.fn().mockResolvedValue(response)
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      apiFetch('/api/tasks', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
    ).resolves.toBe(response)

    expect(fetchMock).toHaveBeenCalledWith('/api/tasks', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  })

  it('throws an ApiError with a safe server message for failed responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Task is invalid.' }), {
          status: 422,
        }),
      ),
    )

    await expect(apiFetch('/api/tasks')).rejects.toEqual(
      expect.objectContaining<ApiError>({
        message: 'Task is invalid.',
        name: 'ApiError',
        status: 422,
      }),
    )
  })
})
