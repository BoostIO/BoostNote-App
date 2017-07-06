import {
  combineReducers
} from 'redux'
import * as ReposCreatePage from './repos/create'

export interface State {
  preferences: any
  repos: {
    create: ReposCreatePage.State
  }
}

export type Actions = ReposCreatePage.Actions

export const reducer = combineReducers({
  repos: combineReducers({
    create: ReposCreatePage.reducer
  })
})

export {
  ReposCreatePage
}
