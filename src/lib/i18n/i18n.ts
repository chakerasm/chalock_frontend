import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { fallbackLanguage, resources } from './resources'

void i18n.use(initReactI18next).init({
  fallbackLng: fallbackLanguage,
  interpolation: {
    escapeValue: false,
  },
  lng: fallbackLanguage,
  react: {
    useSuspense: false,
  },
  resources,
})

export { i18n }
