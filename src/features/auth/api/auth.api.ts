import {
  authenticationResponseSchema,
  authUserSchema,
} from '@/features/auth/schemas/auth.schemas'
import type {
  AuthenticationResponseFromAPI,
  AuthUserFromAPI,
  LoginInput,
  RegisterInput,
} from '@/features/auth/types/auth.types'
import { apiFetch } from '@/lib/api/client'

async function readJson(response: Response): Promise<unknown> {
  return response.json()
}

async function authenticate(
  path: '/auth/login' | '/auth/register',
  input: LoginInput | RegisterInput,
): Promise<AuthenticationResponseFromAPI> {
  const response = await apiFetch(path, {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    skipUnauthorizedHandler: true,
  })

  return authenticationResponseSchema.parse(await readJson(response))
}

export function login(input: LoginInput) {
  return authenticate('/auth/login', input)
}

export function register(input: RegisterInput) {
  return authenticate('/auth/register', input)
}

export async function getCurrentUser(): Promise<AuthUserFromAPI> {
  const response = await apiFetch('/auth/me', { skipUnauthorizedHandler: true })
  return authUserSchema.parse(await readJson(response))
}
