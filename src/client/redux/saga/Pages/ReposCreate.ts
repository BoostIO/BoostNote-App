import { SagaIterator } from 'redux-saga'
import {
  ActionTypes
} from '../../actions/Pages/ReposCreate'
import {
  take,
  select,
  call,
  put
} from 'redux-saga/effects'
import { Repository } from 'client/lib/db/Repository'
import { State } from 'client/redux'
import { ActionCreators as RepositoryMapActionCreators } from 'client/redux/actions/RepositoryMap'
import { history } from 'client/lib/history'

export function * saga (): SagaIterator {
  while (true) {
    yield take(ActionTypes.SubmitForm)
    const form: {name: string} = yield select((state: State): {name: string} => state.pages.ReposCreate)
    yield call(Repository.create, form.name, {})
    yield put(RepositoryMapActionCreators.addRepository({
      name: form.name
    }))
    yield call(history.push, {
      pathname: '/'
    })
  }
}
