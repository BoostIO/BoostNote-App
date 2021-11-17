import { SerializedStatus } from './status'
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
  | Prop<'status', SerializedStatus>

export type SerializedPropData =
  | Prop<'string', NullablePropData<string>>
  | Prop<'date', NullablePropData<Date>>
  | Prop<'json', any>
  | Prop<'number', NullablePropData<number>>
  | Prop<'user', NullablePropData<SerializedUserTeamPermissions>>
  | Prop<'status', NullablePropData<SerializedStatus>>

export type PropType = SerializedPropData['type']
export type StaticPropType = 'creation_date' | 'update_date' | 'label'
export type PropSubType = 'timeperiod'

export type Props = Record<string, SerializedPropData>
