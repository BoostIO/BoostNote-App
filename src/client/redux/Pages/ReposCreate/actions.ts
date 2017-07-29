import * as Typed from 'typed-redux-kit'
import {
  FormState
} from './state'

export enum ActionTypes {
  UpdateForm = 'UPDATE_FORM',
  SubmitForm = 'SUBMIT_FORM'
}

export namespace Actions {
  export interface UpdateFormAction extends Typed.PayloadAction<ActionTypes.UpdateForm, FormState> {}
  export interface SubmitFormAction extends Typed.PureAction<ActionTypes.SubmitForm> {}
}

export type Actions = Actions.UpdateFormAction | Actions.SubmitFormAction

export const ActionCreators = {
  updateForm: Typed.createActionCreator<Actions.UpdateFormAction>(ActionTypes.UpdateForm),
  submitForm: Typed.createActionCreator<Actions.SubmitFormAction>(ActionTypes.SubmitForm),
}
