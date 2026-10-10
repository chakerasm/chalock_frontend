import {
  bulkCreateGoalTasksFromAPI,
  createTaskFromAPI,
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
  BulkCreateGoalTasksRequest,
  CreateTaskInput,
  DeleteTaskInput,
  Task,
  TaskListFilters,
  UpdateTaskInput,
} from '@/features/tasks/types/tasks.types'

/**
 * The API should return one row per Task, but duplicate records must not make
 * client lists render the same Task twice or send duplicate Planner requests.
 */
export function deduplicateTasks(tasks: Task[]) {
  return Array.from(new Map(tasks.map((task) => [task.id, task])).values())
}

export async function getTasks(filters: TaskListFilters = {}) {
  return deduplicateTasks((await getTasksFromAPI(filters)).map(mapTaskFromAPI))
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

export async function deleteTask(input: DeleteTaskInput) {
  await deleteTaskFromAPI(input)
}
