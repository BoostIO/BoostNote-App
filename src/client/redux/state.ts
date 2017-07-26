import {
  Location,
  UI,
  RepositoryMap,
} from './'
import * as Pages from './pages'

export interface State {
  location: Location.State
  pages: Pages.State
  ui: UI.State
  RepositoryMap: RepositoryMap.State
}
