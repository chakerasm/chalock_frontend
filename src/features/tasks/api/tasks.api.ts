import {
  bulkCreateGoalTasksRequestSchema,
  bulkCreateGoalTasksResponseSchema,
  createTaskInputSchema,
  taskFromAPISchema,
  taskListResponseFromAPISchema,
  updateTaskInputSchema,
} from '@/features/tasks/schemas/tasks.schemas'
import type {
  BulkCreateGoalTasksRequest,
  BulkCreateGoalTasksResponseFromAPI,
  CreateTaskInput,
  DeleteTaskInput,
  TaskFromAPI,
  TaskListFilters,
  UpdateTaskInput,
} from '@/features/tasks/types/tasks.types'
import { ApiError, apiFetch } from '@/lib/api/client'
import { parseApiJson } from '@/lib/api/response'

const tasksEndpoint = '/api/tasks'

export type BulkTaskValidationError = ApiError & {
  body: {
    code: 'BULK_TASK_VALIDATION_FAILED'
    errors: Array<{ field?: string; index: number; message: string }>
  }
}

export function isBulkTaskValidationError(
  error: unknown,
): error is BulkTaskValidationError {
  if (
    !(error instanceof ApiError) ||
    !error.body ||
    typeof error.body !== 'object'
  )
    return false
  const body = error.body as Record<string, unknown>
  return (
    body.code === 'BULK_TASK_VALIDATION_FAILED' && Array.isArray(body.errors)
  )
}

async function parseResponse<T>(
  response: Response,
  schema: { parse: (data: unknown) => T },
  errorMessage: string,
): Promise<T> {
  if (!response.ok) throw new Error(errorMessage)
  return parseApiJson(response, schema)
}

function createSearchParams(filters: TaskListFilters) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) searchParams.set(key, String(value))
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export async function getTasksFromAPI(
  filters: TaskListFilters = {},
): Promise<TaskFromAPI[]> {
  return parseResponse(
    await apiFetch(`${tasksEndpoint}${createSearchParams(filters)}`),
    taskListResponseFromAPISchema,
    'Unable to load tasks.',
  ).then((response) => response.data)
}

export async function createTaskFromAPI(
  input: CreateTaskInput,
): Promise<TaskFromAPI> {
  const request = createTaskInputSchema.parse(input)
  return parseResponse(
    await apiFetch(tasksEndpoint, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
    taskFromAPISchema,
    'Unable to create the task.',
  )
}

export async function bulkCreateGoalTasksFromAPI(
  goalId: string,
  input: BulkCreateGoalTasksRequest,
): Promise<BulkCreateGoalTasksResponseFromAPI> {
  const request = bulkCreateGoalTasksRequestSchema.parse(input)
  return parseResponse(
    await apiFetch(`/api/goals/${encodeURIComponent(goalId)}/tasks/bulk`, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
    bulkCreateGoalTasksResponseSchema,
    'Unable to import tasks.',
  )
}

export async function updateTaskFromAPI({
  taskId,
  ...input
}: UpdateTaskInput): Promise<TaskFromAPI> {
  const request = updateTaskInputSchema.parse(input)
  return parseResponse(
    await apiFetch(`${tasksEndpoint}/${encodeURIComponent(taskId)}`, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    }),
    taskFromAPISchema,
    'Unable to update the task.',
  )
}

export async function deleteTaskFromAPI({
  occurrenceDate,
  scope,
  taskId,
}: DeleteTaskInput): Promise<void> {
  const query = new URLSearchParams()
  if (occurrenceDate) query.set('occurrenceDate', occurrenceDate)
  if (scope) query.set('scope', scope)
  const suffix = query.size ? `?${query}` : ''
  const response = await apiFetch(
    `${tasksEndpoint}/${encodeURIComponent(taskId)}${suffix}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) throw new Error('Unable to delete the task.')
}
