import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { createStoreContext } from '../../utils/context'
import { UserSettings } from './types'
import { useTranslation } from 'react-i18next'
import { useGlobalData } from '../globalData'
import { useSetState } from 'react-use'
import { useToast } from '../toast'
import { saveUserSettings } from '../../../api/users/settings'
import { toggleSettingsEventEmitter } from '../../utils/events'

export const baseUserSettings: UserSettings = {
  'general.language': 'en-US',
  'general.theme': 'dark',
  'general.editorTheme': 'default',
  'general.codeBlockTheme': 'default',
  'general.customBlockEditorTheme': 'dark',
  'general.editorKeyMap': 'default',
  'general.editorIndentType': 'spaces',
  'general.editorIndentSize': 2,
}

export type SettingsTab =
  | 'personalInfo'
  | 'preferences'
  | 'teamInfo'
  | 'teamMembers'
  | 'integrations'
  | 'teamUpgrade'
  | 'teamSubscription'
  | 'api'

function useSettingsStore() {
  const { globalData, setPartialGlobalData } = useGlobalData()
  const { currentUserSettings, currentUser } = globalData
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('personalInfo')
  const { pushMessage } = useToast()
  const { t } = useTranslation()

  const saveTimer = useRef<any>()

  const initialUserSettings = {
    ...baseUserSettings,
    ...(currentUserSettings != null ? currentUserSettings.value : null),
  }

  const [settings, setSettings] = useSetState<UserSettings>(initialUserSettings)

  useEffect(() => {
    if (saveTimer.current != null) {
      clearTimeout(saveTimer.current)
    }
    if (currentUser == null) {
      return
    }
    saveTimer.current = setTimeout(() => {
      saveUserSettings({
        value: JSON.stringify(settings),
      })
        .then((responseBody) => {
          setPartialGlobalData({ currentUserSettings: responseBody.settings })
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          pushMessage({
            title: t('general.error'),
            description: `An error occurred while saving your settings.`,
          })
        })
    }, 2000)
  }, [settings, setPartialGlobalData, t, pushMessage, currentUser])

  const mergedUserSettings = useMemo(() => {
    return {
      ...baseUserSettings,
      ...settings,
    }
  }, [settings])

  const [closed, setClosed] = useState(true)
  const toggleClosed = useCallback(() => {
    setClosed((previousValue) => {
      return !previousValue
    })
  }, [setClosed])

  const closeSettingsTab = useCallback(() => {
    setClosed(true)
  }, [setClosed])

  const currentLanguage = mergedUserSettings['general.language']
  const { i18n } = useTranslation('settings')
  useEffect(() => {
    i18n.changeLanguage(currentLanguage)
  }, [i18n, currentLanguage])

  const openSettingsTab = useCallback(
    (tab: SettingsTab) => {
      setClosed(false)
      setSettingsTab(tab)
      return
    },
    [setSettingsTab, setClosed]
  )

  const emailNotifications = useMemo(() => {
    if (currentUserSettings != null) {
      return currentUserSettings.emailNotifications
    }

    return 'weekly'
  }, [currentUserSettings])

  useEffect(() => {
    toggleSettingsEventEmitter.listen(toggleClosed)
    return () => {
      toggleSettingsEventEmitter.unlisten(toggleClosed)
    }
  }, [toggleClosed])

  return {
    closed,
    setClosed,
    toggleClosed,
    settings: mergedUserSettings,
    setSettings,
    settingsTab,
    openSettingsTab,
    closeSettingsTab,
    emailNotifications,
  }
}

export const {
  StoreProvider: SettingsProvider,
  useStore: useSettings,
} = createStoreContext(useSettingsStore, 'settings')
