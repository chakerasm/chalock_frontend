import { describe, expect, it } from 'vitest'
import { mapDateToAPI, mapDateToUI } from './date.mapper'

describe('date mappers', () => {
  it('preserves supported date values until a transport conversion is needed', () => {
    expect(mapDateToUI('2026-09-03')).toBe('2026-09-03')
    expect(mapDateToAPI('2026-09-03')).toBe('2026-09-03')
    expect(mapDateToUI(null)).toBeNull()
    expect(mapDateToAPI(undefined)).toBeUndefined()
  })
})
