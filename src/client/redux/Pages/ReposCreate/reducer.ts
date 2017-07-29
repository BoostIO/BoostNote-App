import {
  State,
  initialState
} from './state'
import {
  ActionTypes,
  Actions
} from './actions'

export const reducer = (state: State = initialState, action: Actions) => {
  switch (action.type) {
    case ActionTypes.UpdateForm:
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload
        }
      }
  }
  return state
}
