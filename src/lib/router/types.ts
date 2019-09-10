import { ParsedUrlQuery } from 'querystring'

export interface Location {
  pathname: string
  hash: string
  query: ParsedUrlQuery
}
