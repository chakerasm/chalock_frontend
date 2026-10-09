import type { FocusTimerSnapshot } from '@/features/focus/types/focus.types'
import type {
  Goal,
  GoalFocusSummary,
  GoalProgressSummary,
} from '@/features/goals/types/goals.types'
import type { Task } from '@/features/tasks/types/tasks.types'

export function getGoalProgressSummary(
  goal: Goal,
  tasks: Task[],
  tasksAvailable = true,
): GoalProgressSummary {
  if (goal.progressStrategy.mode === 'manual') {
    return {
      completedTasks: 0,
      isAvailable: true,
      progress: clampProgress(goal.progress),
      totalTasks: 0,
    }
  }

  if (!tasksAvailable) {
    return {
      completedTasks: 0,
      isAvailable: false,
      progress: clampProgress(goal.progress),
      totalTasks: 0,
    }
  }

  // An unbounded series has no stable denominator. Completed occurrences remain
  // visible in history, but do not alter Goal percentages until Goals support
  // an explicit recurrence window.
  const linkedTasks = tasks.filter(
    (task) => task.goalId === goal.id && !task.seriesId,
  )
  const completedTasks = linkedTasks.filter(
    (task) => task.status === 'completed',
  ).length
  return {
    completedTasks,
    isAvailable: true,
    progress:
      linkedTasks.length === 0
        ? 0
        : Math.round((completedTasks / linkedTasks.length) * 100),
    totalTasks: linkedTasks.length,
  }
}

export function getGoalFocusSummary(
  goalId: string,
  snapshot: FocusTimerSnapshot,
): GoalFocusSummary {
  const completedTimers = snapshot.savedSessions.filter(
    (session) => session.goalId === goalId && session.status === 'completed',
  )
  const completedPomodoros = snapshot.pomodoroHistory.filter(
    (session) =>
      session.goalId === goalId && session.completionState === 'completed',
  )
  return {
    sessionCount: completedTimers.length + completedPomodoros.length,
    totalSeconds:
      completedTimers.reduce(
        (total, session) => total + session.durationSeconds,
        0,
      ) +
      completedPomodoros.reduce(
        (total, session) => total + session.durationSeconds,
        0,
      ),
  }
}

function clampProgress(progress: number) {
  return Math.max(0, Math.min(100, Math.round(progress)))
}
