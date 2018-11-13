import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import DataStore from './stores/DataStore'
import AppStore from './stores/AppStore'

const data = new DataStore()
const app = new AppStore({
  data
})

const providerProps = {
  data,
  app
}

function render (Component: typeof App) {
  ReactDOM.render(
      <Provider {...providerProps}>
        <BrowserRouter>
          <Component />
        </BrowserRouter>
      </Provider>,
    document.getElementById('root')
  )
}

if (module.hot != null) {
  module.hot.accept('./App', () => {
    render(App)
  })
}
render(App)
