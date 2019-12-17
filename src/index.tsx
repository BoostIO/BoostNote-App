import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { RouterProvider } from './lib/router'
import { ContextMenuProvider } from './lib/contextMenu'
import { DialogProvider } from './lib/dialog'
import { ModalProvider } from './lib/modal'
import { combineProviders } from './lib/utils/context'
import { DbProvider } from './lib/db'
import { PreferencesProvider } from './lib/preferences'
import { GeneralStatusProvider } from './lib/generalStatus'
import { PreviewStyleProvider } from './lib/preview'
import { ToastProvider } from './lib/toast'

const CombinedProvider = combineProviders(
  PreviewStyleProvider,
  GeneralStatusProvider,
  ModalProvider,
  DialogProvider,
  ContextMenuProvider,
  DbProvider,
  PreferencesProvider,
  RouterProvider,
  ToastProvider
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
