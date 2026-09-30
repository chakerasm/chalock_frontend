const en = {
  settings: {
    appearance: 'Appearance',
    appearanceDescription: 'Choose how Chalock follows your device theme.',
    avatarUrl: 'Avatar URL',
    browserNotifications: 'Browser notifications',
    browserNotificationsDescription:
      'Requires an explicit browser permission grant.',
    browserPermission: 'Browser permission',
    browserPermissionStates: {
      default: 'Not requested. Enable notifications to ask your browser.',
      denied: 'Blocked. Change this permission in your browser settings.',
      granted: 'Allowed by your browser.',
      unsupported: 'This browser does not support notifications.',
    },
    emailNotifications: 'Email notifications',
    emailNotificationsDescription:
      'Email delivery will be available with a future backend service.',
    enableBrowserNotifications: 'Enable browser notifications',
    inAppNotifications: 'In-app notifications',
    inAppNotificationsDescription: 'Show due items inside the application.',
    notificationCategories: 'Notification categories',
    notificationCategoriesDescription:
      'Choose the product areas that may notify you.',
    notificationCategory: {
      finance: 'Finance',
      goals: 'Goals',
      habits: 'Habits',
      planner: 'Planner',
      reminders: 'Reminders',
      subscriptions: 'Subscriptions',
      tasks: 'Tasks',
    },
    notifications: 'Notifications',
    notificationsDescription:
      'Control when and how the application may notify you.',
    notificationsLoadErrorDescription:
      'Notification preferences could not be loaded. Please try again.',
    notificationsLoadErrorTitle: 'We could not load notification preferences.',
    notificationsSaveError: 'Could not save notification preferences.',
    notificationsSaveSuccess: 'Notification preferences saved.',
    quietHours: 'Quiet hours',
    quietHoursDescription:
      'Suppress browser delivery during this local-time range.',
    quietHoursEnd: 'Ends',
    quietHoursStart: 'Starts',
    saveNotifications: 'Save notification preferences',
    sounds: 'Notification sounds',
    soundsDescription: 'Play sound for supported in-app notifications.',
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
