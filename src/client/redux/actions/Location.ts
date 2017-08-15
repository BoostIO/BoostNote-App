import * as Typed from 'typed-redux-kit'

export enum ActionTypes {
  INIT_LOCATION = 'location_INIT_LOCATION',
  CHANGE_LOCATION = 'location_CHANGE_LOCATION',
}

export interface LocationPayload {
  pathname: string
  search: string
  hash: string
}

export namespace Actions {
  export type ChangeLocation = Typed.PayloadAction<ActionTypes.CHANGE_LOCATION, LocationPayload>
}

export type Actions = Actions.ChangeLocation

export const ActionCreators = {
  changeLocation: Typed.createActionCreator<Actions.ChangeLocation>(ActionTypes.CHANGE_LOCATION),
}

export type ActionCreators = typeof ActionCreators
