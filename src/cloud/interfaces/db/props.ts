import { SerializedUserTeamPermissions } from './userTeamPermissions'

interface Prop<T, D> {
  type: T
  data: D | D[]
}

export type PropData =
  | Prop<'string', string>
  | Prop<'date', Date>
  | Prop<'json', any>
  | Prop<'number', number>
  | Prop<'user', SerializedUserTeamPermissions>

export type PropType = PropData['type']

export type Props = Record<string, PropData>
