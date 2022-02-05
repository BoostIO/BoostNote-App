import { SerializedDocWithSupplemental } from './doc'
import { SerializedStatus } from './status'
import { SerializedUserTeamPermissions } from './userTeamPermissions'

export interface Prop<T, S, D> {
  type: T
  data: D | D[]
  subType?: S
  createdAt: string
}

export type FilledSerializedPropData =
  | Prop<'string', PropStringSubtype, string>
  | Prop<'date', undefined, Date>
  | Prop<'number', PropNumberSubtype, number>
  | Prop<'user', undefined, SerializedUserTeamPermissions>
  | Prop<'status', undefined, SerializedStatus>

export type NullablePropData<T> = T | undefined | null
export type SerializedPropData =
  | Prop<'string', PropStringSubtype, NullablePropData<string>>
  | Prop<'date', undefined, NullablePropData<Date>>
  | Prop<'number', PropNumberSubtype, NullablePropData<number>>
  | Prop<'user', undefined, NullablePropData<SerializedUserTeamPermissions>>
  | Prop<'status', undefined, NullablePropData<SerializedStatus>>
  | Prop<
      'compound',
      PropCompoundSubType,
      NullablePropData<SerializedCompoundProp>
    >

export type PropData = Omit<SerializedPropData, 'createdAt'>
export type PropNumberSubtype = 'timeperiod' | 'checkbox'
export type PropStringSubtype = 'url'
export type PropCompoundSubType = 'dependency'

export type PropType = SerializedPropData['type']
export type PropSubType = SerializedPropData['subType']

export type StaticPropType = 'creation_date' | 'update_date' | 'label'

export type Props = Record<string, SerializedPropData>

export type SerializedCompoundProp = {
  string?: string
  date?: Date
  number?: number
  member?: SerializedUserTeamPermissions
  status?: SerializedStatus
  targetDoc?: SerializedDocWithSupplemental
}
