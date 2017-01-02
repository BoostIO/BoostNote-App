import { createStore, applyMiddleware } from 'redux'
import reducers from './reducers'
import thunk from 'redux-thunk'

const store = createStore(reducers, applyMiddleware(thunk))

if (module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(reducers)
  )
}

export default store
