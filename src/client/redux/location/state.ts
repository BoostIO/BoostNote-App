import { history } from 'client/lib/history'

export interface State {
  pathname: string
  search: string
  hash: string
}

export const initialState: State = {
  pathname: history.location.pathname,
  search: history.location.search,
  hash: history.location.hash,
}
