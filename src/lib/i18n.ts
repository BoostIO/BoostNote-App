import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import de from '../locales/de'
import enUS from '../locales/enUS'
import esES from '../locales/esES'
import frFR from '../locales/frFR'
import itIT from '../locales/itIT'
import zhCN from '../locales/zhCN'
import zhHK from '../locales/zhHK'
import zhTW from '../locales/zhTW'
import ja from '../locales/ja'
import ko from '../locales/ko'
import ptBR from '../locales/ptBR'
import ukUA from '../locales/ukUA'

import ruRU from '../locales/ruRU'

const resources = {
  de,
  'en-US': enUS,
  'es-ES': esES,
  'fr-FR': frFR,
  'it-IT': itIT,
  ja,
  ko,
  'pt-BR': ptBR,
  ukUA,
  'ruRU': ruRU,
  'zh-CN': zhCN,
  'zh-HK': zhHK,
  'zh-TW': zhTW,
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en-US',

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
