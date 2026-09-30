export type UserProfileFromAPI = {
  avatarUrl?: string
  bio?: string
  displayName: string
}

export type UserProfile = UserProfileFromAPI

export type TimeFormat = '12h' | '24h'
export type WeekStartsOn = 0 | 1

export type PlanningPreferences = {
  dayEndHour: number
  dayStartHour: number
  defaultBlockMinutes: number
  timeIncrementMinutes: 5 | 10 | 15 | 30
}

export type UserSettingsFromAPI = {
  dateFormat: 'locale' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  defaultCurrency: string
  locale: 'en' | 'fr'
  planning: PlanningPreferences
  theme: 'dark' | 'light' | 'system'
  timeFormat: TimeFormat
  timezone: string
  weekStartsOn: WeekStartsOn
}

export type UserSettings = UserSettingsFromAPI

export type SettingsSnapshotFromAPI = {
  profile: UserProfileFromAPI
  settings: UserSettingsFromAPI
}

export type SettingsSnapshot = {
  profile: UserProfile
  settings: UserSettings
}

export type UpdateSettingsInput = SettingsSnapshot
