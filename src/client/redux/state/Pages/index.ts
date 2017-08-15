import { TrackableRecord } from 'typed-redux-kit'
import { ReposCreateState } from './ReposCreate'

interface PagesStateBase {
  ReposCreate: ReposCreateState
}

export type PagesState = TrackableRecord<PagesStateBase>
export const PagesState = TrackableRecord<PagesStateBase>({
  ReposCreate: ReposCreateState()
})
