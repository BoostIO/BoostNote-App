import { useCallback, useEffect, useMemo } from 'react'
import Analytics from '@aws-amplify/analytics'
import Auth from '@aws-amplify/auth'
import { usePreferences, useFirstUser } from './preferences'
import { useEffectOnce } from 'react-use'
import { osName } from './platform'
import isElectron from 'is-electron'
import { createStoreContext } from './context'

const amplifyConfig = {
  Auth: {
    identityPoolId: process.env.AMPLIFY_AUTH_IDENTITY_POOL_ID,
    region: process.env.AMPLIFY_AUTH_REGION,
  },
}

const analyticsConfig = {
  AWSPinpoint: {
    appId: process.env.AMPLIFY_PINPOINT_APPID,
    region: process.env.AMPLIFY_PINPOINT_REGION,
    mandatorySignIn: false,
  },
}
Auth.configure(amplifyConfig)
Analytics.configure(analyticsConfig)

function reportViaPinpoint(name: string, attributes?: any) {
  if (process.env.NODE_ENV === 'production') {
    Analytics.record({ name, attributes })
  }
}

interface AnalyticsStore {
  report: (name: string, attributes?: any) => void
}

function useAnalyticsStore(): AnalyticsStore {
  const { preferences } = usePreferences()
  const analyticsEnabled = preferences['general.enableAnalytics']
  const user = useFirstUser()

  useEffectOnce(() => {
    reportViaPinpoint('init')
  })

  const userId = useMemo(() => {
    return user != null ? user.id.toString() : null
  }, [user])

  useEffect(() => {
    const endpointConfig: any = {
      attributes: {
        target: [osName],
        target2: [`${isElectron() ? 'electron' : 'web'}:${osName}`],
      },
    }

    if (userId != null) {
      endpointConfig.userId = userId
    }
    Analytics.updateEndpoint(endpointConfig)
  }, [userId])

  const report = useCallback(
    (name: string, attributes?: any) => {
      if (analyticsEnabled) {
        reportViaPinpoint(name, attributes)
      }
    },
    [analyticsEnabled]
  )

  return {
    report,
  }
}

export const {
  StoreProvider: AnalyticsProvider,
  useStore: useAnalytics,
} = createStoreContext(useAnalyticsStore)

export const analyticsEvents = {
  createNote: 'notes.create',
  updateNote: 'notes.update',
  trashNote: 'notes.trash',
  createStorage: 'storages.create',
  createFolder: 'folders.create',
  updateUiTheme: 'preferences.updateUiTheme',
  updateEditorTheme: 'preferences.updateEditorTheme',
}
