import {
  ActionTypes,
  Actions
} from '../actions/Location'
import {
  State,
} from '../state'

export const reducer = (state: State, action: Actions) => {
  switch (action.type) {
    case ActionTypes.CHANGE_LOCATION:
      const {
        pathname,
        search,
        hash,
      } = action.payload
      state.Location.merge(action.payload)
  }
  return state
}
