import { useCallback } from 'react'
import Analytics from '@aws-amplify/analytics'
import Auth from '@aws-amplify/auth'
import { usePreferences } from './preferences'

const amplifyConfig = {
  Auth: {
    identityPoolId: process.env.AMPLIFY_AUTH_IDENTITY_POOL_ID,
    region: process.env.AMPLIFY_AUTH_REGION
  }
}

Auth.configure(amplifyConfig)

const analyticsConfig = {
  AWSPinpoint: {
    appId: process.env.AMPLIFY_PINPOINT_APPID,
    region: process.env.AMPLIFY_PINPOINT_REGION,
    mandatorySignIn: false
  }
}

Analytics.configure(analyticsConfig)

const initilalized = (window as any).initilalized
if (!initilalized) {
  ;(window as any).initilalized = true
  Analytics.record('init')
}

export function useAnalytics() {
  const { preferences } = usePreferences()
  const analyticsEnabled = preferences['general.enableAnalytics']

  const report = useCallback(
    (name: string, attributes?: { [key: string]: string }) => {
      if (analyticsEnabled) {
        if (attributes == null) {
          Analytics.record({ name: name })
        } else {
          Analytics.record({ name, attributes })
        }
      }
    },
    [analyticsEnabled]
  )

  return {
    report
  }
}
