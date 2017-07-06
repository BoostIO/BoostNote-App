import * as TypedReduxKit from 'typed-redux-kit'

export enum ActionTypes {
  TOGGLE_NAV = 'ui_TOGGLE_NAV',
}

export namespace Action {
  export type ToggleNav = TypedReduxKit.PureAction<ActionTypes.TOGGLE_NAV>
}

export type Actions = Action.ToggleNav

export const ActionCreators = {
  toggleNav: TypedReduxKit.createActionCreator<Action.ToggleNav>(ActionTypes.TOGGLE_NAV),
}

export type ActionCreators = typeof ActionCreators
