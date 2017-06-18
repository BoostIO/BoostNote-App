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
    case ActionType.TOGGLE_NAV:
      return {
        ...state,
        isNavOpen: !state.isNavOpen,
      }
  }
  return state
}
