import {
  history,
} from 'client/lib'
import {
  applyMiddleware,
  createStore,
  compose,
  Store,
  StoreEnhancerStoreCreator,
} from 'redux'
import { createLogger } from 'redux-logger'
import { trackEnhancer } from 'typed-redux-kit'
import createSagaMiddleware from 'redux-saga'
import { State } from './state'
import * as Actions from './actions'
import { reducer } from './reducers'
import { saga } from './saga'

const sagaMiddleWare = createSagaMiddleware()
const logger = createLogger({
  collapsed: true
})

export const store = createStore(
  reducer.reduce,
  compose<StoreEnhancerStoreCreator<State>>(
    trackEnhancer,
    applyMiddleware(sagaMiddleWare, logger),
  ),
)

const unlisten = history.listen((location) => {
  store.dispatch(Actions.Location.ActionCreators.changeLocation({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  }))
})

sagaMiddleWare.run(saga)
