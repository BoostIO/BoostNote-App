import * as Redux from 'redux'

export interface RootAction extends Redux.Action {
  type: string
  payload: any
}
