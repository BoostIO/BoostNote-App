import {
  Action,
  ActionType,
} from './actions'
import {
  initialState,
  State,
} from './state'

export const reducer = (state: State = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.CHANGE_LOCATION:
      return {
        ...action.payload,
      }
  }
  return state
}
