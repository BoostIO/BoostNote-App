import reducers from './reducers'
import { createStore } from 'redux'

const store = createStore(reducers)

if (module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(reducers)
  )
}

export default store
