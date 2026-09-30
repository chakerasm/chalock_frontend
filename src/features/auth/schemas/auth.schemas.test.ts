import { describe, expect, it } from 'vitest'
import { loginInputSchema } from '@/features/auth/schemas/auth.schemas'

describe('loginInputSchema', () => {
  it('accepts a valid email and password', () => {
    expect(
      loginInputSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      }).success,
    ).toBe(true)
  })

  it('rejects malformed emails and short passwords', () => {
    expect(
      loginInputSchema.safeParse({ email: 'not-an-email', password: 'short' })
        .success,
    ).toBe(false)
  })
})
