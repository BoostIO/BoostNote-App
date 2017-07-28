import { SagaIterator } from 'redux-saga'
import {
  ActionTypes
} from './actions'
import {
  take,
  select,
  call,
  put
} from 'redux-saga/effects'
import {
  FormState
} from './state'
import { Repository } from 'client/lib/Repository'
import { State } from 'client/redux'
import * as RepositoryMap from 'client/redux/RepositoryMap'
import { history } from 'client/lib/history'

export function * saga (): SagaIterator {
  while (true) {
    yield take(ActionTypes.SubmitForm)
    const form: FormState = yield select((state: State): FormState => state.ReposCreatePage.form)
    yield call(Repository.create, form.name, {})
    yield put(RepositoryMap.ActionCreators.addRepository({
      name: form.name
    }))
    yield call(history.push, {
      pathname: '/'
    })
  }
}
