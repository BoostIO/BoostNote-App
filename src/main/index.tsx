import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import App from './components/App'
import { Router } from 'react-router-dom'
import DataStore from './stores/DataStore'
import AppStore from './stores/AppStore'
import RouteStore from './stores/RouteStore'
import { createBrowserHistory } from 'history'

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
