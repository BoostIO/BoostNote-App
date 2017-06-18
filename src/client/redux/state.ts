import { UI } from './'
import * as Pages from './pages'

export interface State {
  // location = Location
  pages: Pages.State
  ui: UI.State
}
