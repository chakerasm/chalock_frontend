export type BrowserNotificationPermission =
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported'

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

export async function requestBrowserNotificationPermission(): Promise<BrowserNotificationPermission> {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.requestPermission()
}
