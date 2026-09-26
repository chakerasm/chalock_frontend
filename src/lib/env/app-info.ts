export const appInfo = {
  environment: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION ?? '0.1.0',
} as const
