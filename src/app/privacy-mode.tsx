import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

const PRIVACY_MODE_STORAGE_KEY = 'chalock:privacy-mode'

type PrivacyModeContextValue = {
  isPrivacyMode: boolean
  togglePrivacyMode: () => void
}

const PrivacyModeContext = createContext<PrivacyModeContextValue | null>(null)

export function PrivacyModeProvider({ children }: { children: ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(PRIVACY_MODE_STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    window.localStorage.setItem(PRIVACY_MODE_STORAGE_KEY, String(isPrivacyMode))
  }, [isPrivacyMode])

  return (
    <PrivacyModeContext.Provider
      value={{
        isPrivacyMode,
        togglePrivacyMode: () => setIsPrivacyMode((value) => !value),
      }}
    >
      {children}
    </PrivacyModeContext.Provider>
  )
}

export function usePrivacyMode() {
  const context = useContext(PrivacyModeContext)
  if (!context) {
    throw new Error('usePrivacyMode must be used within PrivacyModeProvider')
  }
  return context
}
