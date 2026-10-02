import { IconButton } from '@chakra-ui/react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePrivacyMode } from '@/app/privacy-mode'

export function PrivacyModeToggle() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode()
  const { t } = useTranslation()
  const label = t(
    isPrivacyMode
      ? 'app.privacyMode.showAmounts'
      : 'app.privacyMode.hideAmounts',
  )

  return (
    <IconButton
      aria-label={label}
      aria-pressed={isPrivacyMode}
      onClick={togglePrivacyMode}
      size="sm"
      title={label}
      variant="ghost"
    >
      {isPrivacyMode ? (
        <EyeOff aria-hidden="true" size={18} />
      ) : (
        <Eye aria-hidden="true" size={18} />
      )}
    </IconButton>
  )
}
