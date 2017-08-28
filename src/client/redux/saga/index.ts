import { SagaIterator } from 'redux-saga'
import {
  fork,
  call,
  put,
} from 'redux-saga/effects'
import * as Actions from '../actions'
import * as Pages from './Pages'
import { saga as uiSaga} from './UI'
import { TrackableMap } from 'typed-redux-kit'
import { RepositoryMap, Repository as RepositoryRecord, FolderMap, NoteMap, Folder, Note } from '../state/RepositoryMap'
import { Repository, SerializedRepositoryBundleMap } from 'client/lib/Repository'

function * loadData (): SagaIterator {
  yield call(Repository.initialize)
  const serializedRepositoryMap: SerializedRepositoryBundleMap = yield call(Repository.getSerializedRepositoryBundleMap)
  const repositoryMap: RepositoryMap = new TrackableMap()
  for (const [repositoryName, serializedRepository] of serializedRepositoryMap.entries()) {
    // TODO: So redundant iteration
    const folderEntries = Array.from(serializedRepository.folderMap.entries()).map(([folderName, folder]) => [folderName, Folder(folder)] as [string, Folder])
    const noteEntries = Array.from(serializedRepository.noteMap.entries()).map(([noteId, note]) => [noteId, Note(note)] as [string, Note])
    const folderMap = new TrackableMap(folderEntries)
    const noteMap = new TrackableMap(noteEntries)

    repositoryMap.set(repositoryName, RepositoryRecord({
      folderMap,
      noteMap,
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
  yield fork(Pages.ReposShow.saga)
  yield fork(uiSaga)
}
