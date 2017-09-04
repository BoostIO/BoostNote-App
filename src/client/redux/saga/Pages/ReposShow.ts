import { take, apply, put } from 'redux-saga/effects'
import { Actions } from 'client/redux'
import { Repository } from 'client/lib/db/Repository'
import Types from 'client/types'

export function * saga () {
  while (true) {
    const action: Actions.Pages.ReposShow.Actions.UpdateNote = yield take(Actions.Pages.ReposShow.ActionTypes.UpdateNote)
    const {
      repositoryName,
      noteId,
      content
    } = action.payload

    const repository = Repository.get(action.payload.repositoryName)
    const note: Types.Note = yield apply(
      repository, repository.putNote, [noteId, {
      content,
      updatedAt: new Date(),
    }])
    yield put(Actions.RepositoryMap.ActionCreators.updateNote({
      repositoryName,
      noteId,
      note,
    }))
  }
}
