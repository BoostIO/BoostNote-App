import * as TypedReduxKit from 'typed-redux-kit'
import { Repository } from '../state/RepositoryMap'

export enum ActionTypes {
  InitializeRepositoryMap = 'repository_map_InitializeRepositoryMap',
  AddRepository = 'repository_map_AddRepository',
  RemoveRepository = 'repository_map_RemoveRepository',
}

export namespace Actions {
  export interface InitializeRepositoryMap extends TypedReduxKit.PayloadAction<ActionTypes.InitializeRepositoryMap, {
    repositoryMap: {
      [name: string]: Repository
    }
  }> {}

  export interface AddRepository extends TypedReduxKit.PayloadAction<ActionTypes.AddRepository, {
    name: string
  }> {}

  export interface RemoveRepository extends TypedReduxKit.PayloadAction<ActionTypes.RemoveRepository, {
    name: string
  }> {}

}

export type Actions =
  Actions.InitializeRepositoryMap |
  Actions.AddRepository |
  Actions.RemoveRepository

export const ActionCreators = {
  initializeRepositoryMap: TypedReduxKit.createActionCreator<Actions.InitializeRepositoryMap>(ActionTypes.InitializeRepositoryMap),
  addRepository: TypedReduxKit.createActionCreator<Actions.AddRepository>(ActionTypes.AddRepository),
  removeRepository: TypedReduxKit.createActionCreator<Actions.RemoveRepository>(ActionTypes.RemoveRepository),
}

export type ActionCreators = typeof ActionCreators
