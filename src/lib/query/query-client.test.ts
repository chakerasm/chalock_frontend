import { describe, expect, it } from 'vitest'
import { createQueryClient } from './query-client'

describe('createQueryClient', () => {
  it('uses the application query defaults', () => {
    const client = createQueryClient()

    expect(client.getDefaultOptions().queries).toMatchObject({
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    })
  })
})
