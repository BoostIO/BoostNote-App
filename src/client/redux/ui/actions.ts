import { TypedRedux } from 'lib'

export enum ActionType {
  TOGGLE_NAV = 'ui_TOGGLE_NAV',
}

export namespace Action {
  export type ToggleNav = TypedRedux.PayloadlessAction<ActionType.TOGGLE_NAV>
}

export type Action = Action.ToggleNav

export const ActionCreators = {
  toggleNav: TypedRedux.createActionCreator<Action.ToggleNav>(ActionType.TOGGLE_NAV),
}

export type ActionCreators = typeof ActionCreators
