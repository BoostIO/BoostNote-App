import { DocStatus } from '../../../../../interfaces/db/doc'

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
  startDate: string // Date string, relative date(today-x)
  endDate: string
}

export type CreationDateCondition = {
  type: 'creation_date'
  startDate: string // Date string, relative date(today-x)
  endDate: string
}

export type UpdateDateCondition = {
  type: 'creation_date'
  startDate: string // Date string, relative date(today-x)
  endDate: string
}

export type AssigneesCondition = {
  type: 'assignees'
  value: string[]
}
export type PrimaryCondition = AndCondition | OrCondition

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
  date: Date | null
}

export type BetweenDateConditionValue = {
  type: 'between'
  from: Date | null
  to: Date | null
}

export type AfterDateConditionValue = {
  type: 'after'
  date: Date | null
}

export type BeforeDateConditionValue = {
  type: 'before'
  date: Date | null
}

export type DateConditionValue =
  | TodayDateConditionValue
  | InWeekDateConditionValue
  | InMonthDateConditionValue
  | SpecificDateConditionValue
  | BetweenDateConditionValue
  | AfterDateConditionValue
  | BeforeDateConditionValue

export type EditibleDueDateCondition = {
  type: 'due_date'
  value: DateConditionValue
}
export type EditibleCreationDateCondition = {
  type: 'creation_date'
  value: DateConditionValue
}
export type EditibleUpdateDateCondition = {
  type: 'update_date'
  value: DateConditionValue
}

export type NullSecondaryCondition = {
  type: 'null'
}

export type EditibleSecondaryCondition =
  | NullSecondaryCondition
  | StatusCondition
  | LabelsCondition
  | EditibleDueDateCondition
  | EditibleCreationDateCondition
  | EditibleUpdateDateCondition
  | AssigneesCondition

export type EditibleSecondaryConditionType =
  | 'null'
  | 'status'
  | 'labels'
  | 'due_date'
  | 'assignees'
  | 'creation_date'
  | 'update_date'
