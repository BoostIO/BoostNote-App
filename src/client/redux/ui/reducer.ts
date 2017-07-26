import {
  ActionTypes,
} from './actions'
import {
  AllActions,
} from '../actions'
import {
  initialState,
  State,
} from './state'

export const reducer = (state: State = initialState, action: AllActions) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_NAV:
      return {
        ...state,
        isNavOpen: !state.isNavOpen,
      }
  }
  return state
}
