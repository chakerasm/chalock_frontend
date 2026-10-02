import { afterEach, describe, expect, it, vi } from 'vitest'
import { type ApiError, apiFetch, setApiAccessToken } from './client'

describe('apiFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    setApiAccessToken(undefined)
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

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/tasks$/),
      expect.objectContaining({ method: 'POST' }),
    )
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/v1/tasks')
    expect(url).not.toContain('/api/v1/api/v1/')
    expect(new Headers(request.headers).get('Accept')).toBe('application/json')
    expect(new Headers(request.headers).get('Content-Type')).toBe(
      'application/json',
    )
  })

  it('adds the current JWT as a bearer token to API requests', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    setApiAccessToken('access-token')

    await apiFetch('/api/tasks')

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/v1/tasks')
    expect(url).not.toContain('/api/v1/api/v1/')
    expect(new Headers(request.headers).get('Authorization')).toBe(
      'Bearer access-token',
    )
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
