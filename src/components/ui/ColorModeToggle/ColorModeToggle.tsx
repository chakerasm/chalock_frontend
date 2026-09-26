import { IconButton } from '@chakra-ui/react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function ColorModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  return (
    <IconButton
      aria-label={t(
        isDark ? 'app.colorMode.switchToLight' : 'app.colorMode.switchToDark',
      )}
      disabled={!isMounted}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      size="sm"
      variant="ghost"
    >
      {isDark ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
    </IconButton>
  )
}
