import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import { Provider } from 'mobx-react'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router'
import { Router } from 'react-router'
import createBrowserHistory from 'history/createBrowserHistory'

const routerStore = new RouterStore()

const stores = {
  router: routerStore
}

const history = syncHistoryWithStore(createBrowserHistory(), routerStore)

function render (AppComponent: typeof React.Component) {
  ReactDOM.render(
    <Provider {...stores}>
      <Router history={history}>
        <AppComponent />
      </Router>
    </Provider>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App.tsx', () => {
    render(App)
  })
}
