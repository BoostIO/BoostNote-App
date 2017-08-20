import { TrackableRecord, TrackableMap } from 'typed-redux-kit'
import { UIState } from './UI'
import { PagesState } from './Pages'
import { LocationState } from './Location'
import { RepositoryMap } from './RepositoryMap'

interface StateBase {
  ui: UIState
  pages: PagesState
  location: LocationState
  repositoryMap: RepositoryMap
}

export type State = TrackableRecord<StateBase>
export const State = TrackableRecord<StateBase>({
  ui: UIState(),
  pages: PagesState(),
  location: LocationState(),
  repositoryMap: new TrackableMap(),
})
