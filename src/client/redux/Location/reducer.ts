import {
  ActionTypes,
  Actions
} from './actions'
import {
  initialState,
  State,
} from './state'

export const reducer = (state: State = initialState, action: Actions) => {
  switch (action.type) {
    case ActionTypes.CHANGE_LOCATION:
      return {
        ...action.payload,
      }
  }
  return state
}
