import {
  clearAuthSessionFromStorage,
  getAuthSessionFromStorage,
  saveAuthSessionToStorage,
} from '@/features/auth/api/auth.local-storage'
import {
  mapAuthSessionFromAPI,
  mapAuthSessionToAPI,
} from '@/features/auth/mappers/auth.mapper'
import {
  authSessionSchema,
  loginInputSchema,
} from '@/features/auth/schemas/auth.schemas'
import type {
  AuthSession,
  AuthUser,
  LoginInput,
} from '@/features/auth/types/auth.types'

const localSessionDurationMs = 1000 * 60 * 60 * 12

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

function displayNameFromEmail(email: string) {
  const [name] = email.split('@')
  return name
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

export async function restoreSession(): Promise<AuthUser | undefined> {
  const stored = getAuthSessionFromStorage()
  if (!stored) return undefined
  const session = authSessionSchema.safeParse(stored)
  if (!session.success || Date.parse(session.data.expiresAt) <= Date.now()) {
    clearAuthSessionFromStorage()
    return undefined
  }
  return mapAuthSessionFromAPI(session.data).user
}

export async function signIn(input: LoginInput): Promise<AuthUser> {
  const request = loginInputSchema.parse(input)
  const user: AuthUser = {
    displayName: displayNameFromEmail(request.email),
    email: request.email.toLowerCase(),
    id: `local-${request.email.toLowerCase()}`,
  }
  const session: AuthSession = {
    expiresAt: new Date(Date.now() + localSessionDurationMs).toISOString(),
    user,
  }
  saveAuthSessionToStorage(mapAuthSessionToAPI(session))
  return user
}

export async function signOut() {
  clearAuthSessionFromStorage()
}
