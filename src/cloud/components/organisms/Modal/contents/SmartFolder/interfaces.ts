import {
  StatusCondition,
  LabelsCondition,
  AssigneesCondition,
  TodayDateConditionValue,
  InWeekDateConditionValue,
  InMonthDateConditionValue,
} from '../../../../../interfaces/db/smartFolder'

export type EditibleBetweenDateConditionValue = {
  type: 'between'
  from: Date | null
  to: Date | null
}

export type EditibleAfterDateConditionValue = {
  type: 'after'
  date: Date | null
}

export type EditibleBeforeDateConditionValue = {
  type: 'before'
  date: Date | null
}

export type EditibleSpecificDateConditionValue = {
  type: 'specific'
  date: Date | null
}

export type EditibleDateConditionValue =
  | TodayDateConditionValue
  | InWeekDateConditionValue
  | InMonthDateConditionValue
  | EditibleSpecificDateConditionValue
  | EditibleBeforeDateConditionValue
  | EditibleAfterDateConditionValue
  | EditibleBetweenDateConditionValue

export type EditibleDueDateCondition = {
  type: 'due_date'
  value: EditibleDateConditionValue | null
}
export type EditibleCreationDateCondition = {
  type: 'creation_date'
  value: EditibleDateConditionValue | null
}
export type EditibleUpdateDateCondition = {
  type: 'update_date'
  value: EditibleDateConditionValue | null
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
