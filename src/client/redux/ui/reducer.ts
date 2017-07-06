import {
  ActionTypes,
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
    case ActionTypes.TOGGLE_NAV:
      return {
        ...state,
        isNavOpen: !state.isNavOpen,
      }
  }
  return state
}
