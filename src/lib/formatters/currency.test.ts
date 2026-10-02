import { describe, expect, it } from 'vitest'
import { formatCurrency } from '@/lib/formatters/currency'

describe('formatCurrency', () => {
  it('places the ISO currency code after the amount', () => {
    expect(formatCurrency(130, 'MAD', 'en-US')).toBe('130.00 MAD')
  })
})
