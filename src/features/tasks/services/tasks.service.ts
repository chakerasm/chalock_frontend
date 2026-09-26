import {
  createTaskFromAPI,
  deleteTaskFromAPI,
  getTasksFromAPI,
  updateTaskFromAPI,
} from '@/features/tasks/api/tasks.api'
import { mapTaskFromAPI } from '@/features/tasks/mappers/tasks.mapper'
import type {
  CreateTaskInput,
  TaskListFilters,
  UpdateTaskInput,
} from '@/features/tasks/types/tasks.types'

export async function getTasks(filters: TaskListFilters = {}) {
  return (await getTasksFromAPI(filters)).map(mapTaskFromAPI)
}

export async function createTask(input: CreateTaskInput) {
  return mapTaskFromAPI(await createTaskFromAPI(input))
}

export async function updateTask(input: UpdateTaskInput) {
  return mapTaskFromAPI(await updateTaskFromAPI(input))
}

export async function deleteTask(taskId: string) {
  await deleteTaskFromAPI(taskId)
}
