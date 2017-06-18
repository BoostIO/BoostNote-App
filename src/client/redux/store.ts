import {
  applyMiddleware,
  createStore,
} from 'redux'
import { createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import { reducer } from './reducer'
import { saga } from './saga'

const sagaMiddleWare = createSagaMiddleware()
const logger = createLogger()

export const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleWare, logger),
)

sagaMiddleWare.run(saga)
