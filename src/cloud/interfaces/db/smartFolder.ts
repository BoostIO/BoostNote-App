import { DocStatus } from './doc'
import { SerializedTeam } from './team'
import { SerializedUser } from './user'

export interface SerializableSmartFolderProps {
  id: string
  name: string
  private: boolean
  teamId: string
  userId: string
}

export interface SerializedUnserializableSmartFolderProps {
  condition: SerializedPrimaryCondition
  team?: SerializedTeam
  user?: SerializedUser
  createdAt: string
  updatedAt: string
}

export type SerializedSmartFolder = SerializableSmartFolderProps &
  SerializedUnserializableSmartFolderProps

export type AndCondition = {
  type: 'and'
  conditions: SecondaryCondition[]
}

export type OrCondition = {
  type: 'or'
  conditions: SecondaryCondition[]
}

export type StatusCondition = {
  type: 'status'
  value: DocStatus
}

export type LabelsCondition = {
  type: 'labels'
  value: string[]
}

export type DueDateCondition = {
  type: 'due_date'
  value: DateConditionValue
}

export type CreationDateCondition = {
  type: 'creation_date'
  value: DateConditionValue
}

export type UpdateDateCondition = {
  type: 'update_date'
  value: DateConditionValue
}

export type AssigneesCondition = {
  type: 'assignees'
  value: string[]
}

export type PrimaryCondition = AndCondition | OrCondition

export type SerializeDate<P extends object> = P extends Date
  ? string
  : P extends { [key: string]: any }
  ? SerializeDateProps<P>
  : P

export type SerializeDateProps<C extends { [key: string]: any }> = {
  [K in keyof C]: SerializeDate<C[K]>
}
export type SerializedPrimaryCondition = SerializeDateProps<PrimaryCondition>

export type SecondaryCondition =
  | StatusCondition
  | LabelsCondition
  | DueDateCondition
  | CreationDateCondition
  | UpdateDateCondition
  | AssigneesCondition

export type DateConditionValueType =
  | 'today'
  | '7_days'
  | '30_days'
  | 'specific'
  | 'between'
  | 'after'
  | 'before'

export type TodayDateConditionValue = {
  type: 'today'
}

export type InWeekDateConditionValue = {
  type: '7_days'
}

export type InMonthDateConditionValue = {
  type: '30_days'
}

export type SpecificDateConditionValue = {
  type: 'specific'
  date: Date
}

export type BetweenDateConditionValue = {
  type: 'between'
  from: Date
  to: Date
}

export type AfterDateConditionValue = {
  type: 'after'
  date: Date
}

export type BeforeDateConditionValue = {
  type: 'before'
  date: Date
}

export type DateConditionValue =
  | TodayDateConditionValue
  | InWeekDateConditionValue
  | InMonthDateConditionValue
  | SpecificDateConditionValue
  | BetweenDateConditionValue
  | AfterDateConditionValue
  | BeforeDateConditionValue
