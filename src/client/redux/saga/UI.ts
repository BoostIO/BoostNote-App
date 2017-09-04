import { SagaIterator } from 'redux-saga'
import {
  fork,
  call,
  put,
  take,
  select,
  apply,
} from 'redux-saga/effects'
import * as Actions from '../actions'
import { Repository } from 'client/lib/db/Repository'
import { State } from '../state'
import Types from 'client/Types'
import { generateRandomId } from 'client/lib/utils'

/**
 * Create Note
 *
 * 1. take RequestCreateNote action
 * 2. select repositoryName
 *   - check pathname has repositoryName
 *   - If it doesn't have, try to get it from the first repository in repoMap
 * 3. select folderName
 *   - check pathname has folderName
 *   - if it doesn't have, use Notes
 * 4. call Repository.createNote
 * 5. set data & redirect to page
 */
function * createNoteSaga () {
  while (true) {
    yield take(Actions.UI.ActionTypes.RequestCreateNote)

    const repositoryNameMatch = yield select((state: State) => state.location.pathname.match(/\/repos\/([^\/]+)/))
    let repositoryName
    if (repositoryNameMatch) {
      repositoryName = repositoryNameMatch[1]
    } else {
      const [name] = yield select((state: State) => state.repositoryMap[Symbol.iterator]().next().value)
      repositoryName = name
    }

    // TODO: Should try to select folderName from pathname
    const folderName = 'Notes'

    const repository = Repository.get(repositoryName)
    let noteId
    while (true) {
      noteId = generateRandomId()
      const hasNote = yield call([repository, repository.hasNote], noteId)
      if (!hasNote) {
        break
      }
    }
    const note: Types.Note = {
      content: '',
      folder: folderName,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    yield call([repository, repository.putNote],
      noteId,
      note,
    )

    yield put(Actions.RepositoryMap.ActionCreators.updateNote({
      repositoryName,
      noteId,
      note,
    }))
  }
}

export function * saga () {
  yield fork(createNoteSaga)
}
