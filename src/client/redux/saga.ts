import { SagaIterator } from 'redux-saga'
import {
  fork,
  call
} from 'redux-saga/effects'
import { UI, Pages } from './'
import { Repository } from 'client/lib/Repository'

function * loadNotes (): SagaIterator {
  yield call(Repository.loadRepositoryMap)

  // TODO get all notes from each db
}

export function * saga (): SagaIterator {
  yield fork(loadNotes)
  yield fork(UI.saga)
  yield fork(Pages.ReposCreatePage.saga)
}
