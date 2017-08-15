import {
  State,
} from '../../state'
import {
  ActionTypes,
  Actions
} from '../../actions/Pages/ReposCreate'

export const reducer = (state: State, action: Actions) => {
  switch (action.type) {
    case ActionTypes.UpdateForm:
      state.Pages.ReposCreate.name = action.payload.name
  }
  return state
}
