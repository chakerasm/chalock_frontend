import { getCurrentUser, login, register } from '@/features/auth/api/auth.api'
import {
  clearAuthSessionFromStorage,
  getAuthSessionFromStorage,
  saveAuthSessionToStorage,
} from '@/features/auth/api/auth.local-storage'
import {
  mapAuthenticationResponseFromAPI,
  mapAuthenticationResponseToAPI,
  mapAuthUserFromAPI,
} from '@/features/auth/mappers/auth.mapper'
import {
  authenticationResponseSchema,
  loginInputSchema,
  registerInputSchema,
} from '@/features/auth/schemas/auth.schemas'
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
} from '@/features/auth/types/auth.types'
import { ApiError, setApiAccessToken } from '@/lib/api/client'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function restoreSession(): Promise<AuthUser | undefined> {
  const stored = getAuthSessionFromStorage()
  if (!stored) return undefined
  const session = authenticationResponseSchema.safeParse(stored)
  if (!session.success) {
    clearAuthSessionFromStorage()
    return undefined
  }
  const authentication = mapAuthenticationResponseFromAPI(session.data)
  setApiAccessToken(authentication.accessToken)

  try {
    const user = mapAuthUserFromAPI(await getCurrentUser())
    saveAuthSessionToStorage(
      mapAuthenticationResponseToAPI({ ...authentication, user }),
    )
    return user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await signOut()
      return undefined
    }

    // Keep a previously validated session during a transient backend failure.
    return authentication.user
  }
}

export async function signIn(input: LoginInput): Promise<AuthUser> {
  const request = loginInputSchema.parse(input)
  const authentication = mapAuthenticationResponseFromAPI(await login(request))
  saveAuthSessionToStorage(mapAuthenticationResponseToAPI(authentication))
  setApiAccessToken(authentication.accessToken)
  return authentication.user
}

export async function signUp(input: RegisterInput): Promise<AuthUser> {
  const request = registerInputSchema.parse(input)
  const authentication = mapAuthenticationResponseFromAPI(
    await register(request),
  )
  saveAuthSessionToStorage(mapAuthenticationResponseToAPI(authentication))
  setApiAccessToken(authentication.accessToken)
  return authentication.user
}

export async function signOut() {
  clearAuthSessionFromStorage()
  setApiAccessToken(undefined)
}
