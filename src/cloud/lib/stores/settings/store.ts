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
import { useToast } from '../../../../design/lib/stores/toast'
import { UpgradeTabOpeningOptions } from '../../../components/settings/UpgradeTab'
import { isEqual } from 'lodash'

export const baseUserSettings: UserSettings = {
  'general.language': 'en-US',
  'general.theme': 'dark',
  'general.editorTheme': 'default',
  'general.codeBlockTheme': 'default',
  'general.customBlockEditorTheme': 'dark',
  'general.editorKeyMap': 'default',
  'general.editorIndentType': 'spaces',
  'general.editorIndentSize': 2,
  'general.editorFontSize': 15,
  'general.editorFontFamily':
    'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
}

export type SettingsTab =
  | 'personalInfo'
  | 'preferences'
  | 'teamInfo'
  | 'teamMembers'
  | 'integrations'
  | 'integrations.github'
  | 'integrations.slack'
  | 'teamUpgrade'
  | 'teamSubscription'
  | 'api'
  | 'feedback'
  | 'import'
  | 'attachments'
  | 'blockeditor'

export type SettingsTabOpeningOptions = UpgradeTabOpeningOptions

function useSettingsStore() {
  const { globalData, setPartialGlobalData } = useGlobalData()
  const { currentUserSettings, currentUser } = globalData
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('personalInfo')
  const [settingsOpeningOptions, setSettingsOpeningOptions] = useState<
    SettingsTabOpeningOptions
  >()

  const { pushMessage } = useToast()

  const saveTimer = useRef<any>()

  const initialUserSettings = {
    ...baseUserSettings,
    ...(currentUserSettings != null ? currentUserSettings.value : null),
  }

  const [settings, setSettings] = useSetState<UserSettings>(initialUserSettings)
  const previousSettingsRef = useRef(settings)
  const currentUserId = currentUser?.id
  useEffect(() => {
    if (saveTimer.current != null) {
      clearTimeout(saveTimer.current)
    }
    if (currentUserId == null) {
      return
    }
    if (isEqual(previousSettingsRef.current, settings)) {
      return
    }

    previousSettingsRef.current = settings
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
            title: 'Error',
            description: `An error occurred while saving your settings.`,
          })
        })
    }, 2000)
  }, [settings, setPartialGlobalData, pushMessage, currentUserId])

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
    setSettingsOpeningOptions(undefined)
  }, [setClosed])

  const currentLanguage = mergedUserSettings['general.language']
  const { i18n } = useTranslation('settings')
  useEffect(() => {
    i18n.changeLanguage(currentLanguage)
  }, [i18n, currentLanguage])

  const openSettingsTab = useCallback(
    (tab: SettingsTab, options?: SettingsTabOpeningOptions) => {
      setClosed(false)
      setSettingsOpeningOptions(options)
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
    settingsOpeningOptions,
    openSettingsTab,
    closeSettingsTab,
    emailNotifications,
  }
}

export const {
  StoreProvider: SettingsProvider,
  useStore: useSettings,
} = createStoreContext(useSettingsStore, 'settings')
