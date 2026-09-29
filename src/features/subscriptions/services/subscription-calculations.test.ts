import { describe, expect, it } from 'vitest'
import type { Subscription } from '@/features/subscriptions/types/subscriptions.types'
import {
  getAnnualCost,
  getMonthlyCost,
  getRecurringCostSummary,
  getRenewalUrgency,
} from './subscription-calculations'

describe('subscription cost calculations', () => {
  it('normalizes supported billing cycles', () => {
    expect(getMonthlyCost(10, 'monthly')).toBe(10)
    expect(getAnnualCost(120, 'annual')).toBe(120)
    expect(getAnnualCost(30, 'quarterly')).toBe(120)
    expect(getAnnualCost(30, 'semiannual')).toBe(60)
    expect(getAnnualCost(10, 'weekly')).toBe(520)
    expect(getAnnualCost(20, 'custom', { unit: 'month', value: 2 })).toBe(120)
  })

  it('excludes paused, cancelled, expired, and trial records', () => {
    const base = {
      amount: 10,
      autoRenew: true,
      billingCycle: 'monthly' as const,
      currency: 'USD',
      id: '1',
      name: 'Example',
      nextBillingDate: '2026-10-01',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    expect(
      getRecurringCostSummary([
        { ...base, status: 'active' },
        { ...base, id: '2', status: 'paused' },
        { ...base, id: '3', status: 'trial' },
      ] as Subscription[]),
    ).toEqual({ annual: 120, monthly: 10 })
  })

  it('classifies renewal urgency', () => {
    const today = new Date('2026-10-01T12:00:00')
    expect(getRenewalUrgency('2026-10-01', today)).toBe('today')
    expect(getRenewalUrgency('2026-10-02', today)).toBe('tomorrow')
    expect(getRenewalUrgency('2026-10-07', today)).toBe('week')
    expect(getRenewalUrgency('2026-10-30', today)).toBe('month')
    expect(getRenewalUrgency('2027-01-01', today)).toBe('later')
  })
})
