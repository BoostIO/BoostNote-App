import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import App from './components/App'
import { Router } from 'react-router-dom'
import { RouteStore } from './lib/RouteStore'
import { ContextMenuProvider } from './lib/contextMenu'
import { createBrowserHistory } from 'history'
import { DialogProvider } from './lib/dialog'
import { combineProviders } from './lib/utils/context'
import { DbProvider } from './lib/db'

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

const providerProps = {
  route
}

const CombinedProvider = combineProviders(
  DialogProvider,
  ContextMenuProvider,
  DbProvider
)

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
