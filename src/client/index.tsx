import { createBrowserHistory } from 'history'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Main } from './components/base/Main'
import { store } from './redux/store'

// Ignore drag & drop event
document.addEventListener('drop', (e) => {
  e.preventDefault()
  e.stopPropagation()
})
document.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.stopPropagation()
})

// const history = createBrowserHistory()
// history.listen((location) => {
//   store.dispatch(Actions.location.changeLocation(location))
// })

// store.dispatch(Actions.location.initLocation(history.location))

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
  module.hot.accept('./components/base/Main', render)
}
