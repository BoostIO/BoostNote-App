import { TrackableRecord } from 'typed-redux-kit'
import { UIState } from './UI'
import { PagesState } from './Pages'
import { LocationState } from './Location'
import { RepositoryMap } from './RepositoryMap'

interface StateBase {
  UI: UIState
  Pages: PagesState
  Location: LocationState
  RepositoryMap: RepositoryMap
}

export type State = TrackableRecord<StateBase>
export const State = TrackableRecord<StateBase>({
  UI: UIState(),
  Pages: PagesState(),
  Location: LocationState(),
  RepositoryMap,
})
