import { NativeSelect } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  fallbackLanguage,
  isSupportedLanguage,
  supportedLanguages,
} from '@/lib/i18n/resources'

export function LanguageSelect() {
  const { i18n, t } = useTranslation()
  const resolvedLanguage = i18n.resolvedLanguage ?? ''
  const language = isSupportedLanguage(resolvedLanguage)
    ? resolvedLanguage
    : fallbackLanguage

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <NativeSelect.Root rounded="l1" size="sm" variant="subtle" width="auto">
      <NativeSelect.Field
        aria-label={t('app.language')}
        onChange={(event) => {
          if (isSupportedLanguage(event.target.value)) {
            void i18n.changeLanguage(event.target.value)
          }
        }}
        value={language}
      >
        {supportedLanguages.map((supportedLanguage) => (
          <option key={supportedLanguage.code} value={supportedLanguage.code}>
            {supportedLanguage.label}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  )
}
