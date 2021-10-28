import { SerializedTeam } from './team'
import { SerializedUser } from './user'
import { SerializedView } from './view'

export interface SerializableDashboardProps {
  id: string
  name: string
  private: boolean
  teamId: string
  userId: string
}

export interface SerializedUnserializableDashboardProps {
  condition: SerializedQuery
  team?: SerializedTeam
  user?: SerializedUser
  createdAt: string
  updatedAt: string
  views?: SerializedView[]
}

export type SerializedDashboard = SerializableDashboardProps &
  SerializedUnserializableDashboardProps

export type SerializedQuery = SerializeDateProps<Query>

export type Query = Condition[]

export interface ConditionType<T extends string, U extends any> {
  type: T
  value: U
  rule: 'and' | 'or'
  inverse?: boolean
}

export type Condition =
  | ConditionType<'query', Query>
  | ConditionType<'label', string>
  | ConditionType<'due_date', DateCondition>
  | ConditionType<'creation_date', DateCondition>
  | ConditionType<'update_date', DateCondition>
  | ConditionType<'prop', { name: string; value: any }>

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
