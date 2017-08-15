import { SagaIterator } from 'redux-saga'
import {
  fork,
  call,
  put,
} from 'redux-saga/effects'
import * as Actions from '../actions'
import * as Pages from './Pages'
import { Repository } from 'client/lib/Repository'

function * loadData (): SagaIterator {
  yield call(Repository.initialize)
  const repositoryMap = yield call(Repository.getSerializedRepositoryMapWithNoteMap)

  yield put(Actions.RepositoryMap.ActionCreators.initializeRepositoryMap({
    repositoryMap
  }))
}

export function * saga (): SagaIterator {
  // Bootstrap
  yield call(loadData)

  // Run
  yield fork(Pages.ReposCreate.saga)
}
