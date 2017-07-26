import * as TypedRedux from 'typed-redux-kit'
import { combineReducers } from 'redux'
import { SagaIterator } from 'redux-saga'
import { fork } from 'redux-saga/effects'
import * as ReposCreatePage from './ReposCreate'

export interface State {
  preferences: any
  ReposCreate: ReposCreatePage.State
}
export type ActionTypes = ReposCreatePage.ActionTypes
export const ActionTypes = ReposCreatePage.ActionTypes
export type Actions = ReposCreatePage.Actions

export const reducer = new TypedRedux.MappedReducer<State, ActionTypes, Actions>({})

reducer.set(Object.values(ReposCreatePage.ActionTypes), (state: State, action: ReposCreatePage.Actions): State => ({
  ...state,
  ReposCreate: {
    ...state.ReposCreate,
    ...ReposCreatePage.reducer(state.ReposCreate, action)
  }
}))

export function * saga (): SagaIterator {
  yield fork(ReposCreatePage.saga)
}

export {
  ReposCreatePage
}
