import { TypedRedux } from 'lib'

export enum ActionType {
  INIT_LOCATION = 'location_INIT_LOCATION',
  CHANGE_LOCATION = 'location_CHANGE_LOCATION',
}

export interface LocationPayload {
  pathname: string
  search: string
  hash: string
}

export namespace Action {
  export type ChangeLocation = TypedRedux.Action<ActionType.CHANGE_LOCATION, LocationPayload>
}

export type Action = Action.ChangeLocation

export const ActionCreators = {
  changeLocation: TypedRedux.createActionCreator<Action.ChangeLocation>(ActionType.CHANGE_LOCATION),
}

export type ActionCreators = typeof ActionCreators
