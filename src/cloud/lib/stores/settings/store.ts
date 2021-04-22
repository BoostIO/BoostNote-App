import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { createStoreContext } from '../../utils/context'
import { UserSettings } from './types'
import { useTranslation } from 'react-i18next'
import { useGlobalData } from '../globalData'
import { useSetState } from 'react-use'
import { saveUserSettings } from '../../../api/users/settings'
import {
  toggleSettingsEventEmitter,
  toggleSettingsMembersEventEmitter,
} from '../../utils/events'
import { useToast } from '../../../../shared/lib/stores/toast'

export const baseUserSettings: UserSettings = {
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

  const currentUserId = currentUser?.id
  useEffect(() => {
    if (saveTimer.current != null) {
      clearTimeout(saveTimer.current)
    }
    if (currentUserId) {
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
  }, [settings, setPartialGlobalData, t, pushMessage, currentUserId])

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
    return currentUserSettings?.notifications?.summary
  }, [currentUserSettings])

  const togglePreferencesTab = useCallback(() => {
    if (closed || settingsTab !== 'preferences') {
      setSettingsTab('preferences')
      setClosed(false)
      return
    }

    setClosed(true)
  }, [closed, settingsTab])
  useEffect(() => {
    toggleSettingsEventEmitter.listen(togglePreferencesTab)
    return () => {
      toggleSettingsEventEmitter.unlisten(togglePreferencesTab)
    }
  }, [togglePreferencesTab])

  const toggleMembersTab = useCallback(() => {
    if (closed || settingsTab !== 'teamMembers') {
      setSettingsTab('teamMembers')
      setClosed(false)
      return
    }

    setClosed(true)
  }, [closed, settingsTab])

  useEffect(() => {
    toggleSettingsMembersEventEmitter.listen(toggleMembersTab)
    return () => {
      toggleSettingsMembersEventEmitter.unlisten(toggleMembersTab)
    }
  }, [toggleMembersTab])

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
