import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { Router } from 'react-router-dom'
import { RouteProvider, history } from './lib/route'
import { ContextMenuProvider } from './lib/contextMenu'
import { DialogProvider } from './lib/dialog'
import { combineProviders } from './lib/utils/context'
import { DbProvider } from './lib/db'

const CombinedProvider = combineProviders(
  DialogProvider,
  ContextMenuProvider,
  DbProvider,
  RouteProvider
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
      <Router history={history}>
        <Component />
      </Router>
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
