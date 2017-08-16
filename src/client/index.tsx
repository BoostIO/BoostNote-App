import './lib/bootstrap'
import { createBrowserHistory } from 'history'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Main from './base/Main'
import { store } from './redux/store'

let mainElement: HTMLElement | null = document.getElementById('main')
if (mainElement == null) {
  mainElement = document.createElement('main')
  mainElement.setAttribute('id', 'main')
  document.body.appendChild(mainElement)
}

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <Main />
    </Provider>,
    mainElement,
  )
}

render()

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./base/Main', render)
}
