import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from '../locales/enUS'
import faIR from '../locales/faIR'

const resources = {
  'en-US': enUS,
  'fa-IR': faIR,
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'fa-IR'
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', lng)
})

export default i18n
