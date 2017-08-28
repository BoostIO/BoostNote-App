import * as TypedReduxKit from 'typed-redux-kit'

export enum ActionTypes {
  DismissLoading = 'ui_DismissLoading',
  ToggleNav = 'ui_ToggleNav',
  RequestCreateNote = 'ui_RequestCreateNote',
}

export namespace Action {
  export type DismissLoading = TypedReduxKit.PureAction<ActionTypes.DismissLoading>
  export type ToggleNav = TypedReduxKit.PureAction<ActionTypes.ToggleNav>
  export type RequestCreateNote = TypedReduxKit.PureAction<ActionTypes.RequestCreateNote>
}

export type Actions = Action.ToggleNav |
  Action.DismissLoading |
  Action.RequestCreateNote

export const ActionCreators = {
  dismissLoading: TypedReduxKit.createActionCreator<Action.DismissLoading>(ActionTypes.DismissLoading),
  toggleNav: TypedReduxKit.createActionCreator<Action.ToggleNav>(ActionTypes.ToggleNav),
  requestCreateNote: TypedReduxKit.createActionCreator<Action.RequestCreateNote>(ActionTypes.RequestCreateNote),
}

export type ActionCreators = typeof ActionCreators
