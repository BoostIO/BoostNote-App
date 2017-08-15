import {
  TrackableRecord
} from 'typed-redux-kit'

export interface ReposCreateStateBase {
  name: string
}

export type ReposCreateState = TrackableRecord<ReposCreateStateBase>
export const ReposCreateState = TrackableRecord<ReposCreateStateBase>({
  name: '',
})
