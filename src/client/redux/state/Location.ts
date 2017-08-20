import {
  TrackableRecord
} from 'typed-redux-kit'
import { history } from 'client/lib/history'
import Types from 'client/types'

export interface LocationStateBase extends Types.Location {
}

export type LocationState = TrackableRecord<LocationStateBase>
export const LocationState = TrackableRecord<LocationStateBase>({
  pathname: history.location.pathname,
  search: history.location.search,
  hash: history.location.hash,
})
