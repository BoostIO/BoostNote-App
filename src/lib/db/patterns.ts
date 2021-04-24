import { NavResource } from '../v2/interfaces/resources'

export function getResourceId(source: NavResource) {
  if (source.type === 'doc') {
    return source.result._id
  } else {
    return source.result._id
  }
}
