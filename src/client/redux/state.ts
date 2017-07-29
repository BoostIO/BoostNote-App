import * as Location from './Location'
import * as UI from './UI'
import * as ReposCreatePage from './Pages/ReposCreate'
import * as RepositoryMap from './RepositoryMap'

export interface State {
  location: Location.State
  ui: UI.State
  RepositoryMap: RepositoryMap.State,
  ReposCreatePage: ReposCreatePage.State
}

export const initialState = {
  location: Location.initialState,
  ui: UI.initialState,
  RepositoryMap: RepositoryMap.initialState,
  ReposCreatePage: ReposCreatePage.initialState,
}
