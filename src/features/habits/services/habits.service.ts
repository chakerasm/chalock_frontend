import {
  archiveHabitFromAPI,
  createHabitFromAPI,
  getAllHabitLogsFromAPI,
  getHabitsFromAPI,
  updateHabitFromAPI,
  writeHabitLogFromAPI,
} from "@/features/habits/api/habits.api";
import {
  mapHabitFromAPI,
  mapHabitLogFromAPI,
  mapHabitToAPI,
} from "@/features/habits/mappers/habits.mapper";
import type {
  CreateHabitInput,
  HabitListFilter,
  UpdateHabitInput,
  WriteHabitLogInput,
} from "@/features/habits/types/habits.types";

export async function getHabits(filters: HabitListFilter = {}) {
  return (await getHabitsFromAPI(filters)).map(mapHabitFromAPI);
}

export async function createHabit(input: CreateHabitInput) {
  return mapHabitFromAPI(await createHabitFromAPI(mapHabitToAPI(input)));
}

export async function updateHabit(input: UpdateHabitInput) {
  return mapHabitFromAPI(await updateHabitFromAPI(input));
}

export async function archiveHabit(habitId: string) {
  return mapHabitFromAPI(await archiveHabitFromAPI(habitId));
}

export async function getHabitLogs(from: string, to: string) {
  return (await getAllHabitLogsFromAPI(from, to)).map(mapHabitLogFromAPI);
}

export async function writeHabitLog(
  habitId: string,
  date: string,
  input: WriteHabitLogInput,
) {
  return mapHabitLogFromAPI(await writeHabitLogFromAPI(habitId, date, input));
}
