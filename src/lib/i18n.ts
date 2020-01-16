import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from '../locales/enUS'
import esES from '../locales/esEs'
import zhCN from '../locales/zhCN'
import ja from '../locales/ja'
import ko from '../locales/ko'
import ptBR from '../locales/ptBR'

const resources = {
  'en-US': enUS,
  'es-ES': esES,
  'zh-CN': zhCN,
  ja: ja,
  ko: ko,
  'pt-BR': ptBR
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en-US',

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
