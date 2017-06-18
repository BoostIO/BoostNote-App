import { SagaIterator } from 'redux-saga'
import { fork } from 'redux-saga/effects'
import { UI } from './'

export function * saga(): SagaIterator {
  yield fork(UI.saga)
}
