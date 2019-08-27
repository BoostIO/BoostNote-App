import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import App from './components/App'
import { Router } from 'react-router-dom'
import { DataStore } from './lib/db/DataStore'
import AppStore from './lib/AppStore'
import { RouteStore } from './lib/RouteStore'
import { ContextMenuProvider } from './lib/contextMenu'
import { createBrowserHistory } from 'history'
import { DialogProvider } from './lib/dialog'
import { combineProviders } from './lib/utils/context'

const history = createBrowserHistory()
const route = new RouteStore({
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
  state: undefined
})
history.listen(location => {
  route.update(location)
})

const data = new DataStore()
const app = new AppStore({
  data
})

const providerProps = {
  app,
  data,
  route
}

const CombinedProvider = combineProviders(DialogProvider, ContextMenuProvider)

function render(Component: typeof App) {
  let rootDiv = document.getElementById('root')
  if (rootDiv == null) {
    rootDiv = document.createElement('div', {})
    rootDiv.setAttribute('id', 'root')
    document.body.appendChild(rootDiv)
  }
  ReactDOM.render(
    <Provider {...providerProps}>
      <CombinedProvider>
        <Router history={history}>
          <Component />
        </Router>
      </CombinedProvider>
    </Provider>,
    document.getElementById('root')
  )
}

if (module.hot != null) {
  module.hot.accept('./components/App', () => {
    render(App)
  })
}
render(App)
