import {
  ActionTypes,
  Actions,
} from './actions'
import {
  initialState,
  State,
} from './state'

export const reducer = (state: State = initialState, action: Actions) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_NAV:
      return {
        ...state,
        isNavOpen: !state.isNavOpen,
      }
  }
  return state
}
