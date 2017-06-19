import * as Actions from './actions'
import * as Reducer from './reducer'
import * as State from './state'

export namespace Location {
  export type State = State.State
  export type ActionType = Actions.ActionType
  export const ActionType = Actions.ActionType
  export type ActionCreators = Actions.ActionCreators
  export const ActionCreators = Actions.ActionCreators
  export const reducer = Reducer.reducer
}
