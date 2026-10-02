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
  it('accepts database nulls for optional subscription fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              id: 'subscription-1',
              name: 'Example',
              amount: 9.99,
              currency: 'USD',
              billingCycle: 'monthly',
              nextBillingDate: '2026-10-12',
              status: 'active',
              autoRenew: true,
              category: null,
              cancellationDate: null,
              customBillingInterval: null,
              description: null,
              notes: null,
              paymentMethodId: null,
              startDate: null,
              trialEndDate: null,
              websiteUrl: null,
              createdAt: '2026-10-01T09:00:00.000Z',
              updatedAt: '2026-10-01T09:00:00.000Z',
            },
          ]),
          { status: 200 },
        ),
      ),
    )

    await expect(getSubscriptionsFromAPI()).resolves.toEqual([
      expect.objectContaining({ id: 'subscription-1', name: 'Example' }),
    ])
  })
})
