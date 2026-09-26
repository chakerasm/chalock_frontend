import {
  createTaskInputSchema,
  taskFromAPISchema,
  taskListResponseFromAPISchema,
  updateTaskInputSchema,
} from '@/features/tasks/schemas/tasks.schemas'
import type {
  CreateTaskInput,
  TaskFromAPI,
  TaskListFilters,
  UpdateTaskInput,
} from '@/features/tasks/types/tasks.types'

const tasksEndpoint = '/api/tasks'

async function parseResponse<T>(
  response: Response,
  schema: { parse: (data: unknown) => T },
  errorMessage: string,
): Promise<T> {
  if (!response.ok) throw new Error(errorMessage)
  return schema.parse(await response.json())
}

function createSearchParams(filters: TaskListFilters) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value) searchParams.set(key, value)
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export async function getTasksFromAPI(
  filters: TaskListFilters = {},
): Promise<TaskFromAPI[]> {
  return parseResponse(
    await fetch(`${tasksEndpoint}${createSearchParams(filters)}`),
    taskListResponseFromAPISchema,
    'Unable to load tasks.',
  ).then((response) => response.data)
}

export async function createTaskFromAPI(
  input: CreateTaskInput,
): Promise<TaskFromAPI> {
  const request = createTaskInputSchema.parse(input)
  return parseResponse(
    await fetch(tasksEndpoint, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
    taskFromAPISchema,
    'Unable to create the task.',
  )
}

export async function updateTaskFromAPI({
  taskId,
  ...input
}: UpdateTaskInput): Promise<TaskFromAPI> {
  const request = updateTaskInputSchema.parse(input)
  return parseResponse(
    await fetch(`${tasksEndpoint}/${encodeURIComponent(taskId)}`, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    }),
    taskFromAPISchema,
    'Unable to update the task.',
  )
}

export async function deleteTaskFromAPI(taskId: string): Promise<void> {
  const response = await fetch(
    `${tasksEndpoint}/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) throw new Error('Unable to delete the task.')
}
