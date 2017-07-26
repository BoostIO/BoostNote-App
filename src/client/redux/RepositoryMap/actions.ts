import * as TypedReduxKit from 'typed-redux-kit'

export enum ActionTypes {
  AddRepository = 'repository_map_AddRepository',
  RemoveRepository = 'repository_map_RemoveRepository',
}

export namespace Actions {
  export interface AddRepository extends TypedReduxKit.PayloadAction<ActionTypes.AddRepository, {
    name: string
  }> {}
  export interface RemoveRepository extends TypedReduxKit.PayloadAction<ActionTypes.RemoveRepository, {
    name: string
  }> {}
}

export type Actions = Actions.AddRepository | Actions.RemoveRepository

export const ActionCreators = {
  addRepository: TypedReduxKit.createActionCreator<Actions.AddRepository>(ActionTypes.AddRepository),
  removeRepository: TypedReduxKit.createActionCreator<Actions.RemoveRepository>(ActionTypes.RemoveRepository),
}

export type ActionCreators = typeof ActionCreators
