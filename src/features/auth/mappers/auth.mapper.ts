import type {
  AuthenticationResponse,
  AuthenticationResponseFromAPI,
  AuthUser,
  AuthUserFromAPI,
} from '@/features/auth/types/auth.types'

export function mapAuthUserFromAPI(user: AuthUserFromAPI): AuthUser {
  return { ...user }
}

export function mapAuthUserToAPI(user: AuthUser): AuthUserFromAPI {
  return { ...user }
}

export function mapAuthenticationResponseFromAPI(
  response: AuthenticationResponseFromAPI,
): AuthenticationResponse {
  return { ...response, user: mapAuthUserFromAPI(response.user) }
}

export function mapAuthenticationResponseToAPI(
  response: AuthenticationResponse,
): AuthenticationResponseFromAPI {
  return { ...response, user: mapAuthUserToAPI(response.user) }
}
