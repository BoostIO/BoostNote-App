import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { V2ToastProvider } from './shared/lib/stores/toast'
import { V2WindowProvider } from './shared/lib/stores/window'
import { V2DialogProvider } from './shared/lib/stores/dialog'
import { V2ModalProvider } from './shared/lib/stores/modal'
import { V2ContextMenuProvider } from './shared/lib/stores/contextMenu'
import { DbProvider } from './lib/db'
import { RouterProvider } from './lib/router'
import { combineProviders } from './lib/context'
import { PreferencesProvider } from './lib/preferences'
import { GeneralStatusProvider } from './lib/generalStatus'
import { StorageRouterProvider } from './lib/storageRouter'
import { BoostHubStoreProvider } from './lib/boosthub'
import { CloudIntroModalProvider } from './lib/cloudIntroModal'
import { MigrationProvider } from './lib/migrate/store'
import { DialogProvider } from './lib/dialog'

const V2CombinedProvider = combineProviders(
  V2ToastProvider,
  V2WindowProvider,
  V2ContextMenuProvider,
  V2ModalProvider,
  V2DialogProvider
)

const CombinedProvider = combineProviders(
  V2CombinedProvider,
  BoostHubStoreProvider,
  MigrationProvider,
  GeneralStatusProvider,
  DialogProvider,
  DbProvider,
  PreferencesProvider,
  StorageRouterProvider,
  RouterProvider,
  CloudIntroModalProvider
)

function render(Component: typeof App) {
  let rootDiv = document.getElementById('root')
  if (rootDiv == null) {
    rootDiv = document.createElement('div', {})
    rootDiv.setAttribute('id', 'root')
    document.body.appendChild(rootDiv)
  }
  ReactDOM.render(
    <CombinedProvider>
      <Component />
    </CombinedProvider>,
    document.getElementById('root')
  )
}

if (module.hot != null) {
  module.hot.accept('./components/App', () => {
    render(App)
  })
}
render(App)
