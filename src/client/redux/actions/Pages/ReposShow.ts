import * as Typed from 'typed-redux-kit'

export enum ActionTypes {
  UpdateNote = 'UpdateNote',
}

export namespace Actions {
  export interface UpdateNote extends Typed.PayloadAction<ActionTypes.UpdateNote, {
    repositoryName: string,
    noteId: string,
    content: string,
  }> {}
}

export type Actions = Actions.UpdateNote

export const ActionCreators = {
  updateNote: Typed.createActionCreator<Actions.UpdateNote>(ActionTypes.UpdateNote),
}
