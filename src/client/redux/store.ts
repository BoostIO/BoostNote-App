import {
  history,
} from 'client/lib'
import {
  applyMiddleware,
  createStore,
} from 'redux'
import { createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import * as Location from './Location'
import { reducer } from './reducer'
import { saga } from './saga'

const sagaMiddleWare = createSagaMiddleware()
const logger = createLogger({
  collapsed: true
})

export const store = createStore(
  reducer.reduce,
  applyMiddleware(sagaMiddleWare, logger),
)

const unlisten = history.listen((location) => {
  store.dispatch(Location.ActionCreators.changeLocation({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  }))
})

sagaMiddleWare.run(saga)
