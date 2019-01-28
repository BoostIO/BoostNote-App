import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import App from './components/App'
import { Router } from 'react-router-dom'
import { DataStore } from './lib/db/DataStore'
import AppStore from './lib/AppStore'
import { RouteStore } from './lib/RouteStore'
import ContextMenuStore from './lib/contextMenu/ContextMenuStore'
import { createBrowserHistory } from 'history'
import DialogStore from './lib/dialog/DialogStore'

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
const contextMenu = new ContextMenuStore()
const dialog = new DialogStore()

const providerProps = {
  app,
  data,
  route,
  contextMenu,
  dialog
}

function render(Component: typeof App) {
  ReactDOM.render(
    <Provider {...providerProps}>
      <Router history={history}>
        <Component />
      </Router>
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
