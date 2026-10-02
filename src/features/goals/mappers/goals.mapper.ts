import type {
  CreateGoalInput,
  Goal,
  GoalFromAPI,
} from '@/features/goals/types/goals.types'

export function mapGoalFromAPI(goal: GoalFromAPI): Goal {
  return { ...goal, progressStrategy: { ...goal.progressStrategy } }
}

export function mapGoalToAPI(goal: CreateGoalInput): CreateGoalInput {
  if (goal.progressStrategy.mode === 'task-based') {
    const { progress: _progress, ...taskBasedGoal } =
      goal as CreateGoalInput & {
        progress?: number
      }
    return { ...taskBasedGoal, progressStrategy: { mode: 'task-based' } }
  }

  const manualGoal = goal as Extract<
    CreateGoalInput,
    { progressStrategy: { mode: 'manual' } }
  >
  return {
    ...manualGoal,
    progress: manualGoal.progress,
    progressStrategy: { mode: 'manual' },
  }
}
