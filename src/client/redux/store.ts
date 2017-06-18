import {
  applyMiddleware,
  createStore,
} from 'redux'
import createSagaMiddleware from 'redux-saga'
import { reducer } from './reducer'
import { saga } from './saga'

const sagaMiddleWare = createSagaMiddleware()

export const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleWare),
)

sagaMiddleWare.run(saga)
