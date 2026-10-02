import { useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  restoreSession,
  signIn as signInWithSession,
  signOut as signOutSession,
  signUp as signUpWithSession,
} from '@/features/auth/services/auth.service'
import type {
  AuthState,
  AuthUser,
  LoginInput,
  RegisterInput,
} from '@/features/auth/types/auth.types'
import { subscribeToUnauthorized } from '@/lib/api/client'

export type AuthContextValue = AuthState & {
  signIn: (input: LoginInput) => Promise<AuthUser>
  signOut: () => Promise<void>
  signUp: (input: RegisterInput) => Promise<AuthUser>
}

const unavailableAuth: AuthContextValue = {
  signIn: async () => {
    throw new Error('Authentication is unavailable outside AuthProvider.')
  },
  signOut: async () => undefined,
  signUp: async () => {
    throw new Error('Authentication is unavailable outside AuthProvider.')
  },
  status: 'loading',
}

const AuthContext = createContext<AuthContextValue>(unavailableAuth)

type AuthProviderProps = { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    void restoreSession().then((user) => {
      if (!active) return
      setState(
        user
          ? { status: 'authenticated', user }
          : { status: 'unauthenticated' },
      )
    })
    return () => {
      active = false
    }
  }, [])

  const signOut = useCallback(async () => {
    await signOutSession()
    queryClient.clear()
    setState({ status: 'unauthenticated' })
  }, [queryClient])

  useEffect(() => subscribeToUnauthorized(() => void signOut()), [signOut])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn: async (input) => {
        const user = await signInWithSession(input)
        setState({ status: 'authenticated', user })
        return user
      },
      signOut,
      signUp: async (input) => {
        const user = await signUpWithSession(input)
        setState({ status: 'authenticated', user })
        return user
      },
    }),
    [signOut, state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export { unavailableAuth }
