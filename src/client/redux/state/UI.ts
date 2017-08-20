import {
  TrackableRecord
} from 'typed-redux-kit'

export interface UIStateBase {
  isNavOpen: boolean
  isLoading: boolean
}

export type UIState = TrackableRecord<UIStateBase>
export const UIState = TrackableRecord<UIStateBase>({
  isNavOpen: true,
  isLoading: true,
})
