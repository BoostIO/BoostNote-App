import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import DataStore from './stores/DataStore'

const data = new DataStore()

function render (Component: typeof App) {
  ReactDOM.render(
      <Provider data={data}>
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
