import { describe, expect, it } from 'vitest'
import { updateTaskInputSchema } from '@/features/tasks/schemas/tasks.schemas'

describe('task input validation', () => {
  it('rejects titles longer than the backend limit before a request is sent', () => {
    expect(
      updateTaskInputSchema.safeParse({ title: 'a'.repeat(121) }).success,
    ).toBe(false)
  })

  it('requires a title for updates because the backend UpdateTaskDto inherits CreateTaskDto', () => {
    expect(updateTaskInputSchema.safeParse({ status: 'completed' }).success).toBe(
      false,
    )
  })

  it('rejects invalid backend due-time values before a request is sent', () => {
    expect(
      updateTaskInputSchema.safeParse({ dueTime: '29:99', title: 'Task' })
        .success,
    ).toBe(false)
  })
})
