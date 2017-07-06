import {
  ActionType,
} from './actions'
import {
  AllAction,
} from '../actions'
import {
  initialState,
  State,
} from './state'

export const reducer = (state: State = initialState, action: AllAction) => {
  switch (action.type) {
    case ActionType.CHANGE_LOCATION:
      return {
        ...action.payload,
      }
  }
  return state
}
