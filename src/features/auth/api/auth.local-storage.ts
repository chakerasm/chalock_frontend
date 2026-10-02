import type { AuthenticationResponseFromAPI } from '@/features/auth/types/auth.types'

const storageKey = 'chalock.auth-session.v1'

export function getAuthSessionFromStorage():
  | AuthenticationResponseFromAPI
  | undefined {
  if (typeof window === 'undefined') return undefined
  const value = window.localStorage.getItem(storageKey)
  if (!value) return undefined
  try {
    return JSON.parse(value) as AuthenticationResponseFromAPI
  } catch {
    window.localStorage.removeItem(storageKey)
    return undefined
  }
}

export function saveAuthSessionToStorage(
  session: AuthenticationResponseFromAPI,
) {
  if (typeof window !== 'undefined')
    window.localStorage.setItem(storageKey, JSON.stringify(session))
}

export function clearAuthSessionFromStorage() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(storageKey)
}
