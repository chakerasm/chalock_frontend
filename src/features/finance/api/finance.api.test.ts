import { afterEach, describe, expect, it, vi } from 'vitest'
import { getFinanceSnapshotFromAPI } from '@/features/finance/api/finance.api'

describe('finance API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads the finance snapshot from the documented backend resources', async () => {
    const listResponse = () =>
      new Response(JSON.stringify({ data: [], nextCursor: null }), {
        status: 200,
      })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(listResponse())
      .mockResolvedValueOnce(listResponse())
      .mockResolvedValueOnce(listResponse())
      .mockResolvedValueOnce(listResponse())
      .mockResolvedValueOnce(listResponse())
    vi.stubGlobal('fetch', fetchMock)

    await expect(getFinanceSnapshotFromAPI()).resolves.toEqual({
      accounts: [],
      categories: [],
      recurringTransactions: [],
      savingsGoals: [],
      transactions: [],
    })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/\/api\/v1\/accounts$/),
        expect.stringMatching(/\/api\/v1\/finance\/categories$/),
        expect.stringMatching(/\/api\/v1\/recurring-transactions$/),
        expect.stringMatching(/\/api\/v1\/savings-goals$/),
        expect.stringMatching(/\/api\/v1\/transactions$/),
      ]),
    )
  })
})
