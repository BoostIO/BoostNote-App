import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './enUS'
import fr from './fr'

const resources = {
  'en-US': enUS,
  fr: fr,
  ja: enUS,
  kr: enUS,
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en-US',
    fallbackLng: 'en-US',
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
