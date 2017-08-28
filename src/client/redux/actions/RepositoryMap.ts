import * as TypedReduxKit from 'typed-redux-kit'
import { Repository } from '../state/RepositoryMap'
import Types from 'client/Types'

export enum ActionTypes {
  InitializeRepositoryMap = 'repository_map_InitializeRepositoryMap',
  AddRepository = 'repository_map_AddRepository',
  RemoveRepository = 'repository_map_RemoveRepository',
  UpdateNote = 'repository_map_UpdateNote',
}

export namespace Actions {
  export interface InitializeRepositoryMap extends TypedReduxKit.PayloadAction<ActionTypes.InitializeRepositoryMap, {
    repositoryMap: TypedReduxKit.TrackableMap<string, Repository>
  }> {}

  export interface AddRepository extends TypedReduxKit.PayloadAction<ActionTypes.AddRepository, {
    name: string
  }> {}

  export interface RemoveRepository extends TypedReduxKit.PayloadAction<ActionTypes.RemoveRepository, {
    name: string
  }> {}

  export interface UpdateNote extends TypedReduxKit.PayloadAction<ActionTypes.UpdateNote, {
    repositoryName: string
    noteId: string
    note: Types.Note
  }> {}
}

export type Actions =
  Actions.InitializeRepositoryMap |
  Actions.AddRepository |
  Actions.RemoveRepository |
  Actions.UpdateNote

export const ActionCreators = {
  initializeRepositoryMap: TypedReduxKit.createActionCreator<Actions.InitializeRepositoryMap>(ActionTypes.InitializeRepositoryMap),
  addRepository: TypedReduxKit.createActionCreator<Actions.AddRepository>(ActionTypes.AddRepository),
  removeRepository: TypedReduxKit.createActionCreator<Actions.RemoveRepository>(ActionTypes.RemoveRepository),
  updateNote: TypedReduxKit.createActionCreator<Actions.UpdateNote>(ActionTypes.UpdateNote),
}

export type ActionCreators = typeof ActionCreators
