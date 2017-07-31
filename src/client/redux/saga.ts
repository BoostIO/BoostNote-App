import { SagaIterator } from 'redux-saga'
import {
  fork,
  call,
  put,
} from 'redux-saga/effects'
import {
  UI,
  Pages,
  RepositoryMap,
} from './'
import { Repository } from 'client/lib/Repository'

function * loadData (): SagaIterator {
  yield call(Repository.initialize)
  const repositoryMap = yield call(Repository.getSerializedRepositoryMapWithNoteMap)

  yield put(RepositoryMap.ActionCreators.initializeRepositoryMap({
    repositoryMap
  }))
}

export function * saga (): SagaIterator {
  yield fork(loadData)
  yield fork(UI.saga)
  yield fork(Pages.ReposCreatePage.saga)
}
