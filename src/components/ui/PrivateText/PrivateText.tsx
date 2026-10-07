import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrivacyMode } from '@/app/privacy-mode'

type PrivateTextProps = {
  children: ReactNode
  isPrivate?: boolean
}

export function PrivateText({ children, isPrivate }: PrivateTextProps) {
  const { isPrivacyMode } = usePrivacyMode()
  const { t } = useTranslation()

  if (!isPrivacyMode && !isPrivate) return children

  return (
    <span aria-label={t('app.privacyMode.hiddenText')} role="img">
      ••••••••
    </span>
  )
}
