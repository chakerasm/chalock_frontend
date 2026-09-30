import { describe, expect, it } from 'vitest'
import {
  createSearchResults,
  searchResults,
} from '@/features/global-search/services/global-search.service'

describe('global search', () => {
  const results = createSearchResults({
    subscriptions: [
      {
        amount: 99,
        autoRenew: true,
        billingCycle: 'monthly',
        createdAt: '2026-01-01T00:00:00.000Z',
        currency: 'MAD',
        id: 'sub-spotify',
        name: 'Spotify Premium',
        nextBillingDate: '2026-10-12',
        status: 'active',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    tasks: [
      {
        createdAt: '2026-01-01T00:00:00.000Z',
        id: 'task-cancel-spotify',
        priority: 'medium',
        status: 'todo',
        title: 'Cancel Spotify',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
  })

  it('matches multiple domains and groups them by type', () => {
    expect(searchResults(results, 'spotify')).toEqual([
      expect.objectContaining({ type: 'task' }),
      expect.objectContaining({ type: 'subscription' }),
    ])
  })

  it('requires at least two query characters', () => {
    expect(searchResults(results, 's')).toEqual([])
  })

  it('limits each domain independently', () => {
    expect(searchResults(results, 'spotify', 1)[0]?.results).toHaveLength(1)
  })
})
