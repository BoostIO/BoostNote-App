import { SerializedTeam } from './team'
import { SerializedUser } from './user'
import { SerializedDoc } from './doc'
import { SerializedServiceConnection } from './connections'

export interface SerializedCustomBlockComponent {
  id: string
  name: string
  src: string
  code: string
  serviceTypes: string[]
  team?: SerializedTeam
  user?: SerializedUser
  connections?: SerializedServiceConnection[]
}

export interface SerializedCustomBlockInstance {
  id: string
  name: string
  block: SerializedCustomBlockInstance
  cache: string
  arguments: string
  component?: SerializedCustomBlockComponent
  team?: SerializedTeam
  user?: SerializedUser
  doc?: SerializedDoc
}
