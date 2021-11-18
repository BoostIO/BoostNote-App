import { SerializedTeam } from './team'
import { SerializedUser } from './user'
import { SerializedView } from './view'

interface SerializableSmartViewProps {
  id: string
  name: string
  private: boolean
  teamId: string
  userId: string
}

interface SerializedUnserializableSmartViewProps {
  condition: SerializedQuery
  team?: SerializedTeam
  user?: SerializedUser
  createdAt: string
  updatedAt: string
  views?: SerializedView[]
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
  value: U
}

export type SmartViewPropConditionTypes =
  | 'user'
  | 'json'
  | 'string'
  | 'number'
  | 'date'
  | 'status'

export interface JsonPropCondition {
  type: string
  value: any
}

export type PropCondition =
  | PropConditionType<'user', string[]>
  | PropConditionType<'json', JsonPropCondition>
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
