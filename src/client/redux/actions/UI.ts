import * as TypedReduxKit from 'typed-redux-kit'

export enum ActionTypes {
  ToggleNav = 'ui_ToggleNav',
}

export namespace Action {
  export type ToggleNav = TypedReduxKit.PureAction<ActionTypes.ToggleNav>
}

export type Actions = Action.ToggleNav

export const ActionCreators = {
  toggleNav: TypedReduxKit.createActionCreator<Action.ToggleNav>(ActionTypes.ToggleNav),
}

export type ActionCreators = typeof ActionCreators
