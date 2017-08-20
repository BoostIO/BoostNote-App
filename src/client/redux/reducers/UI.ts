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
      state.ui.isNavOpen = !state.ui.isNavOpen
    case ActionTypes.DismissLoading:
      state.ui.isLoading = false
  }
  return state
}
