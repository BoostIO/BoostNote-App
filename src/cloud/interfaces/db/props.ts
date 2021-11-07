import { SerializedUserTeamPermissions } from './userTeamPermissions'

interface Prop<T, D> {
  type: T
  data: D | D[]
  createdAt: string
}

export type PropData = Omit<SerializedPropData, 'createdAt'>
export type NullablePropData<T> = T | undefined

export type FilledSerializedPropData =
  | Prop<'string', string>
  | Prop<'date', Date>
  | Prop<'json', any>
  | Prop<'number', number>
  | Prop<'user', SerializedUserTeamPermissions>

export type SerializedPropData =
  | Prop<'string', NullablePropData<string>>
  | Prop<'date', NullablePropData<Date>>
  | Prop<'json', any>
  | Prop<'number', NullablePropData<number>>
  | Prop<'user', NullablePropData<SerializedUserTeamPermissions>>

export type PropType = SerializedPropData['type']

export type Props = Record<string, SerializedPropData>
