import {
  State,
  initialState
} from './state'
import {
  AllAction
} from '../../../actions'
import {
  ActionTypes
} from './actions'

export const reducer = (state: State = initialState, action: AllAction) => {
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
