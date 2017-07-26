import {
  State,
  initialState
} from './state'
import {
  AllActions
} from '../../actions'
import {
  ActionTypes
} from './actions'

export const reducer = (state: State = initialState, action: AllActions) => {
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
