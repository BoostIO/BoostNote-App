import { createSelector } from 'reselect'
import { State } from 'client/redux'

const getPathname = (state: State) => state.location.pathname

export const getRepositoryName = createSelector(
  getPathname,
  pathname => pathname.match(/\/repos\/([^\/]+)/)[1]
)

export const getNoteId = createSelector(
  getPathname,
  pathname => {
    const match = pathname.match(/\/repos\/[^\/]+\/notes\/([^\/]+)/)
    if (match) return match[1]
  }
)
