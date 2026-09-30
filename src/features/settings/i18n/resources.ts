const en = {
  settings: {
    appearance: 'Appearance',
    appearanceDescription: 'Choose how Chalock follows your device theme.',
    avatarUrl: 'Avatar URL',
    bio: 'Short bio',
    dateFormat: 'Date format',
    dateFormats: {
      'DD/MM/YYYY': 'Day / month / year',
      'MM/DD/YYYY': 'Month / day / year',
      'YYYY-MM-DD': 'Year-month-day',
      locale: 'Use locale default',
    },
    dayEndHour: 'Day ends',
    dayStartHour: 'Day starts',
    defaultBlockMinutes: 'Default block duration',
    defaultCurrency: 'Default currency',
    description:
      'Manage your profile and the preferences shared by your planning and finance tools.',
    displayName: 'Display name',
    eyebrow: 'Account preferences',
    loadErrorDescription:
      'Your settings could not be loaded. Please try again.',
    loadErrorTitle: 'We couldn’t load settings.',
    loading: 'Loading settings',
    locale: 'Language',
    minutes: '{{value}} minutes',
    monday: 'Monday',
    planning: 'Planning',
    planningDescription:
      'These values update new planner blocks and the timeline grid.',
    profile: 'Profile',
    profileDescription: 'A lightweight identity for your workspace.',
    regional: 'Regional',
    regionalDescription:
      'Choose local conventions used when presenting dates and times.',
    save: 'Save changes',
    saveError: 'Could not save settings.',
    saveSuccess: 'Settings saved.',
    sunday: 'Sunday',
    theme: 'Theme',
    themes: { dark: 'Dark', light: 'Light', system: 'System' },
    timeFormat: 'Time format',
    timeFormats: { '12h': '12-hour', '24h': '24-hour' },
    timeIncrementMinutes: 'Planner time increment',
    timezone: 'Timezone',
    title: 'Settings',
    weekStartsOn: 'Week starts on',
  },
}

const fr: typeof en = {
  settings: {
    ...en.settings,
    appearance: 'Apparence',
    defaultCurrency: 'Devise par défaut',
    planning: 'Planification',
    profile: 'Profil',
    regional: 'Régional',
    save: 'Enregistrer les modifications',
    title: 'Paramètres',
  },
}

export const settingsResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const
