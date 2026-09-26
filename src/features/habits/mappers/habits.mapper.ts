import type {
  CreateHabitInput,
  Habit,
  HabitFromAPI,
  HabitLog,
  HabitLogFromAPI,
} from '@/features/habits/types/habits.types'

export function mapHabitFromAPI(habit: HabitFromAPI): Habit {
  return { ...habit, schedule: { ...habit.schedule } }
}

export function mapHabitToAPI(habit: CreateHabitInput): CreateHabitInput {
  return { ...habit, schedule: { ...habit.schedule } }
}

export function mapHabitLogFromAPI(log: HabitLogFromAPI): HabitLog {
  return { ...log }
}

export function mapHabitLogToAPI(log: HabitLog): HabitLog {
  return { ...log }
}
