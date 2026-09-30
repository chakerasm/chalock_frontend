import { describe, expect, it } from 'vitest'
import { isWithinQuietHours } from '@/features/settings/services/notification-preferences-calculations'

describe('isWithinQuietHours', () => {
  it('recognizes a daytime quiet period', () => {
    const quietHours = { enabled: true, end: '12:00', start: '09:00' }

    expect(isWithinQuietHours(quietHours, '08:59')).toBe(false)
    expect(isWithinQuietHours(quietHours, '09:00')).toBe(true)
    expect(isWithinQuietHours(quietHours, '11:59')).toBe(true)
    expect(isWithinQuietHours(quietHours, '12:00')).toBe(false)
  })

  it('recognizes a quiet period that crosses midnight', () => {
    const quietHours = { enabled: true, end: '07:00', start: '22:00' }

    expect(isWithinQuietHours(quietHours, '21:59')).toBe(false)
    expect(isWithinQuietHours(quietHours, '22:00')).toBe(true)
    expect(isWithinQuietHours(quietHours, '06:59')).toBe(true)
    expect(isWithinQuietHours(quietHours, '07:00')).toBe(false)
  })
})
