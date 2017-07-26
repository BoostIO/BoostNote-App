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
    case ActionTypes.CHANGE_LOCATION:
      return {
        ...action.payload,
      }
  }
  return state
}
