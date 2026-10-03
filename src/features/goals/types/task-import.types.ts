import type { TaskPriority } from '@/features/tasks/types/tasks.types'

export const taskImportFields = [
  'title',
  'description',
  'priority',
  'estimatedMinutes',
  'dueDate',
] as const

export type TaskImportField = (typeof taskImportFields)[number]

export type TaskImportError = { field: TaskImportField; message: string }
export type TaskImportWarning = { field?: TaskImportField; message: string }

export type TaskImportRow = {
  description: string
  dueDate: string
  errors: TaskImportError[]
  estimatedMinutes: string
  priority: string
  rowId: string
  selected: boolean
  sourceRowIndex: number
  title: string
  warnings: TaskImportWarning[]
}

export type TaskImportValues = Pick<
  TaskImportRow,
  'title' | 'description' | 'priority' | 'estimatedMinutes' | 'dueDate'
>

export type TaskImportPayload = {
  description?: string
  dueDate?: string
  estimatedMinutes?: number
  priority?: TaskPriority
  title: string
}

export type TaskImportMapping = Partial<Record<string, TaskImportField | 'ignore'>>
