export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";

export type TaskPriority = "low" | "medium" | "high";

export type TaskFromAPI = {
  completedAt?: string;
  createdAt: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  estimatedMinutes?: number;
  goalId?: string;
  id: string;
  priority: TaskPriority;
  status: TaskStatus;
  title: string;
  updatedAt: string;
};

export type Task = TaskFromAPI;

export type TaskListResponseFromAPI = {
  data: TaskFromAPI[];
  nextCursor: string | null;
};

export type CreateTaskInput = {
  description?: string;
  dueDate?: string;
  dueTime?: string;
  estimatedMinutes?: number;
  goalId?: string;
  priority?: TaskPriority;
  title: string;
};

/** Task data accepted by the Goal bulk-import endpoint. */
export type BulkCreateGoalTaskInput = Omit<CreateTaskInput, "goalId">;

export type BulkCreateGoalTasksRequest = {
  tasks: BulkCreateGoalTaskInput[];
};

export type BulkCreateGoalTasksResponseFromAPI = {
  created: number;
};

export type BulkTaskValidationIssue = {
  code?: string;
  field?: keyof BulkCreateGoalTaskInput;
  index: number;
  message: string;
};

export type TaskFormSubmitInput = Omit<CreateTaskInput, "goalId"> & {
  goalId?: string | null;
};

export type UpdateTaskInput = {
  completedAt?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  estimatedMinutes?: number;
  goalId?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  taskId: string;
  title?: string;
};

export type TaskListFilters = {
  dueFrom?: string;
  dueTo?: string;
  goalId?: string;
  priority?: TaskPriority;
  search?: string;
  status?: TaskStatus;
};

export type TaskView = "today" | "upcoming" | "all" | "completed";
