import { NavResource } from '../v2/interfaces/resources'

export function getResourceId(source: NavResource) {
  return source.result._id
}
