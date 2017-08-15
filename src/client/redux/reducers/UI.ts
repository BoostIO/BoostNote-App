import {
  ActionTypes,
  Actions,
} from '../actions/UI'
import {
  State,
} from '../state'

export const reducer = (state: State, action: Actions) => {
  switch (action.type) {
    case ActionTypes.ToggleNav:
      state.UI.isNavOpen = !state.UI.isNavOpen
  }
  return state
}
