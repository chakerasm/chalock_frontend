import { describe, expect, it } from 'vitest'
import { deduplicateTasks } from '@/features/tasks/services/tasks.service'
import type { Task } from '@/features/tasks/types/tasks.types'

function task(id: string, title: string): Task {
  return {
    createdAt: '2026-10-10T09:00:00.000Z',
    id,
    priority: 'medium',
    status: 'todo',
    title,
    updatedAt: '2026-10-10T09:00:00.000Z',
  }
}

describe('deduplicateTasks', () => {
  it('keeps one entry for each task ID', () => {
    expect(
      deduplicateTasks([task('task-1', 'Original'), task('task-1', 'Latest')]),
    ).toEqual([task('task-1', 'Latest')])
  })
})
