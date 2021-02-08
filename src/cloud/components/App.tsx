import React, { useState } from 'react'
import Router from './Router'
import { RouterProvider } from '../lib/router'
import {
  ElectronProvider,
  initAccessToken,
  usingElectron,
  sendToHost,
} from '../lib/stores/electron'
import { GlobalDataProvider } from '../lib/stores/globalData'
import { ToastProvider } from '../lib/stores/toast'
import { useEffectOnce } from 'react-use'
import { gaTrackingId, nodeEnv, boostHubBaseUrl } from '../lib/consts'
import '../lib/i18n'

const App = () => {
  const [accessTokenInitialized, setAccessTokenInitialized] = useState(false)

  useEffectOnce(() => {
    ;(async () => {
      await initAccessToken()
      setAccessTokenInitialized(true)
    })()
  })

  useEffectOnce(() => {
    if (!usingElectron) {
      return
    }
    const handler = (event: MouseEvent) => {
      event.preventDefault()
      sendToHost('open-context-menu')
    }
    window.addEventListener('contextmenu', handler)

    return () => {
      window.removeEventListener('contextmenu', handler)
    }
  })

  if (!accessTokenInitialized) {
    return <div>Fetching access token...</div>
  }
  return (
    <>
      <ToastProvider>
        <GlobalDataProvider>
          <ElectronProvider>
            <RouterProvider>
              <Router />
            </RouterProvider>
          </ElectronProvider>
        </GlobalDataProvider>
      </ToastProvider>

      <script
        async={true}
        src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
                ga('create', '${gaTrackingId}', 'auto');
                ga('send', 'pageview');`,
        }}
      />
      {nodeEnv === 'production' && (
        <script
          type='text/javascript'
          src={`${boostHubBaseUrl}/static/mixpanel.js`}
        />
      )}
    </>
  )
}

export default App
