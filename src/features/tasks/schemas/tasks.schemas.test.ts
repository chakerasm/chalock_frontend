import { describe, expect, it } from 'vitest'
import { updateTaskInputSchema } from '@/features/tasks/schemas/tasks.schemas'

describe('task input validation', () => {
  it('rejects titles longer than the backend limit before a request is sent', () => {
    expect(
      updateTaskInputSchema.safeParse({ title: 'a'.repeat(121) }).success,
    ).toBe(false)
  })
})
