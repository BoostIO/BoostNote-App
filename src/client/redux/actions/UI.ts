import * as TypedReduxKit from 'typed-redux-kit'

export enum ActionTypes {
  ToggleNav = 'ui_ToggleNav',
  DismissLoading = 'ui_DismissLoading'
}

export namespace Action {
  export type ToggleNav = TypedReduxKit.PureAction<ActionTypes.ToggleNav>
  export type DismissLoading = TypedReduxKit.PureAction<ActionTypes.DismissLoading>
}

export type Actions = Action.ToggleNav |
  Action.DismissLoading

export const ActionCreators = {
  toggleNav: TypedReduxKit.createActionCreator<Action.ToggleNav>(ActionTypes.ToggleNav),
  dismissLoading: TypedReduxKit.createActionCreator<Action.DismissLoading>(ActionTypes.DismissLoading)
}

export type ActionCreators = typeof ActionCreators
