import {
  createTaskFromAPI,
  bulkCreateGoalTasksFromAPI,
  deleteTaskFromAPI,
  getTasksFromAPI,
  updateTaskFromAPI,
} from '@/features/tasks/api/tasks.api'
import {
  mapCreateTaskToAPI,
  mapTaskFromAPI,
  mapUpdateTaskToAPI,
} from '@/features/tasks/mappers/tasks.mapper'
import type {
  CreateTaskInput,
  BulkCreateGoalTasksRequest,
  TaskListFilters,
  UpdateTaskInput,
} from '@/features/tasks/types/tasks.types'

export async function getTasks(filters: TaskListFilters = {}) {
  return (await getTasksFromAPI(filters)).map(mapTaskFromAPI)
}

export async function createTask(input: CreateTaskInput) {
  return mapTaskFromAPI(await createTaskFromAPI(mapCreateTaskToAPI(input)))
}

export async function bulkCreateGoalTasks(
  goalId: string,
  input: BulkCreateGoalTasksRequest,
) {
  return bulkCreateGoalTasksFromAPI(goalId, input)
}

export async function updateTask(input: UpdateTaskInput) {
  return mapTaskFromAPI(await updateTaskFromAPI(mapUpdateTaskToAPI(input)))
}

export async function deleteTask(taskId: string) {
  await deleteTaskFromAPI(taskId)
}
