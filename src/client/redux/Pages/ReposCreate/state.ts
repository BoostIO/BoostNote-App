export type FormState = {
  name: string
}

export interface State {
  form: FormState
}

export const initialState: State = {
  form: {
    name: ''
  }
}
