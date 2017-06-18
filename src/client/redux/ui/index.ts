import * as Actions from './actions'
import * as Reducer from './reducer'
import * as Saga from './saga'
import * as State from './state'

export namespace UI {
  export type State = State.State
  export type ActionType = Actions.ActionType
  export const ActionType = Actions.ActionType
  export type ActionCreators = Actions.ActionCreators
  export const ActionCreators = Actions.ActionCreators
  export const saga = Saga.saga
  export const reducer = Reducer.reducer
}
