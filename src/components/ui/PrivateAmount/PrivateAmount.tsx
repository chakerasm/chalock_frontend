import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrivacyMode } from '@/app/privacy-mode'

type PrivateAmountProps = { children: ReactNode; isPrivate?: boolean }

export function PrivateAmount({ children, isPrivate }: PrivateAmountProps) {
  const { isPrivacyMode } = usePrivacyMode()
  const { t } = useTranslation()
  if (!isPrivacyMode && !isPrivate) return children
  return (
    <span aria-label={t('app.privacyMode.hiddenAmount')} role="img">
      ••••
    </span>
  )
}
