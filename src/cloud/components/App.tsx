import React, { useState } from 'react'
import Router from './Router'
import { RouterProvider } from '../lib/router'
import {
  ElectronProvider,
  usingElectron,
  initAccessToken,
} from '../lib/stores/electron'
import { GlobalDataProvider } from '../lib/stores/globalData'
import { ToastProvider } from '../lib/stores/toast'
import { useEffectOnce } from 'react-use'

const App = () => {
  const [accessTokenInitialized, setAccessTokenInitialized] = useState(false)

  useEffectOnce(() => {
    if (usingElectron) {
      ;(async () => {
        await initAccessToken()
        setAccessTokenInitialized(true)
      })()
    }
  })

  if (!accessTokenInitialized) {
    return <div>Fetching access token...</div>
  }
  return (
    <ToastProvider>
      <GlobalDataProvider>
        <ElectronProvider>
          <RouterProvider>
            <Router />
          </RouterProvider>
        </ElectronProvider>
      </GlobalDataProvider>
    </ToastProvider>
  )
}

export default App
