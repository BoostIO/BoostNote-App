import {
  TrackableRecord
} from 'typed-redux-kit'
import { history } from 'client/lib/history'

export interface LocationStateBase {
  pathname: string
  search: string
  hash: string
}

export type LocationState = TrackableRecord<LocationStateBase>
export const LocationState = TrackableRecord<LocationStateBase>({
  pathname: history.location.pathname,
  search: history.location.search,
  hash: history.location.hash,
})
