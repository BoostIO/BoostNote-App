import { SerializedDashboard } from './dashboard'
import { SerializedView } from './view'

interface SerializableSmartViewProps {
  id: string
  name: string
  dashboardId: string
  viewId: number
  data: any
}

interface SerializedUnserializableSmartViewProps {
  condition: SerializedQuery
  dashboard?: SerializedDashboard
  createdAt: string
  updatedAt: string
  view: SerializedView
}

export type SerializedSmartView = SerializableSmartViewProps &
  SerializedUnserializableSmartViewProps

export type SerializedQuery = SerializeDateProps<Query>

export type Query = Condition[]

export interface ConditionType<T extends string, U extends any> {
  type: T
  value: U
  rule: 'and' | 'or'
  inverse?: boolean
}

export interface PropConditionType<T extends string, U extends any> {
  name: string
  type: T
  subType?: string
  value: U
}

export type SmartViewPropConditionTypes =
  | 'user'
  | 'string'
  | 'number'
  | 'date'
  | 'status'

export type PropCondition =
  | PropConditionType<'user', string[]>
  | PropConditionType<'string', string>
  | PropConditionType<'number', number>
  | PropConditionType<'date', DateCondition>
  | PropConditionType<'status', number>

export type Condition =
  | ConditionType<'query', Query>
  | ConditionType<'label', string[]>
  | ConditionType<'creation_date', DateCondition>
  | ConditionType<'update_date', DateCondition>
  | ConditionType<'prop', PropCondition>

export type DateCondition =
  | { type: 'relative'; period: number }
  | { type: 'specific'; date: Date }
  | { type: 'between'; from: Date; to: Date }
  | { type: 'after'; date: Date }
  | { type: 'before'; date: Date }

export type SerializeDate<P extends object> = P extends Date
  ? string
  : P extends { [key: string]: any }
  ? SerializeDateProps<P>
  : P

export type SerializeDateProps<C extends { [key: string]: any }> = {
  [K in keyof C]: SerializeDate<C[K]>
}
