import {
  createTodayTaskFromAPI,
  getTodayDashboardFromAPI,
  startFocusSessionFromAPI,
  updateFocusSessionFromAPI,
  updateHabitCheckInFromAPI,
  updateTodayTaskFromAPI,
} from "@/features/today/api/today.api";
import {
  mapActiveFocusSessionFromAPI,
  mapTodayDashboardFromAPI,
  mapTodayTaskFromAPI,
} from "@/features/today/mappers/today.mapper";
import type {
  CreateTodayTaskInput,
  StartFocusSessionInput,
  UpdateFocusSessionInput,
  UpdateHabitCheckInInput,
  UpdateTodayTaskInput,
} from "@/features/today/types/today.types";

export async function getTodayDashboard() {
  return mapTodayDashboardFromAPI(await getTodayDashboardFromAPI());
}

export async function createTodayTask(input: CreateTodayTaskInput) {
  return mapTodayTaskFromAPI(await createTodayTaskFromAPI(input));
}

export async function updateTodayTask(input: UpdateTodayTaskInput) {
  return mapTodayTaskFromAPI(await updateTodayTaskFromAPI(input));
}

export async function updateHabitCheckIn(input: UpdateHabitCheckInInput) {
  await updateHabitCheckInFromAPI(input);
}

export async function startFocusSession(input: StartFocusSessionInput = {}) {
  return mapActiveFocusSessionFromAPI(await startFocusSessionFromAPI(input));
}

export async function updateFocusSession(input: UpdateFocusSessionInput) {
  return mapActiveFocusSessionFromAPI(await updateFocusSessionFromAPI(input));
}
