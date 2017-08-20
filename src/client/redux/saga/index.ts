import { SagaIterator } from 'redux-saga'
import {
  fork,
  call,
  put,
} from 'redux-saga/effects'
import * as Actions from '../actions'
import * as Pages from './Pages'
import { TrackableMap } from 'typed-redux-kit'
import { RepositoryMap, Repository as RepositoryRecord, FolderMap, NoteMap } from '../state/RepositoryMap'
import { Repository, SerializedRepositoryBundleMap } from 'client/lib/Repository'

function * loadData (): SagaIterator {
  yield call(Repository.initialize)
  const serializedRepositoryMap: SerializedRepositoryBundleMap = yield call(Repository.getSerializedRepositoryBundleMap)
  const repositoryMap: RepositoryMap = new TrackableMap()
  for (const [name, serializedRepository] of serializedRepositoryMap.entries()) {
    const folderMap = serializedRepository
    repositoryMap.set(name, RepositoryRecord({
      folderMap: new TrackableMap(serializedRepository.folderMap),
      noteMap: new TrackableMap(serializedRepository.folderMap)
    } as {
      folderMap: FolderMap
      noteMap: NoteMap
    }))
  }

  yield put([
    Actions.RepositoryMap.ActionCreators.initializeRepositoryMap({
      repositoryMap
    }),
    Actions.UI.ActionCreators.dismissLoading(),
  ])
}

export function * saga (): SagaIterator {
  // Bootstrap
  yield call(loadData)

  // Run
  yield fork(Pages.ReposCreate.saga)
}
