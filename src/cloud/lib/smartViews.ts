import { localizeDate } from '../components/Modal/contents/SmartView/DocDateSelect'
import { Kind } from '../components/Modal/contents/SmartView/interfaces'
import {
  Condition,
  DateCondition,
  SerializeDateProps,
  SerializedQuery,
} from '../interfaces/db/smartView'
import { SerializedDocWithSupplemental } from '../interfaces/db/doc'
import { addDays, addSeconds } from 'date-fns'
import {
  mdiAccountOutline,
  mdiArrowDownDropCircleOutline,
  mdiCalendarMonthOutline,
  mdiClockOutline,
  mdiContentSaveOutline,
  mdiLabelOutline,
  mdiTimerOutline,
} from '@mdi/js'

export const supportedCustomPropertyTypes: Record<
  string,
  { label: string; value: string; icon: string }
> = {
  date: { label: 'Date', value: 'date', icon: mdiCalendarMonthOutline },
  person: { label: 'Person', value: 'user', icon: mdiAccountOutline },
  timeperiod: { label: 'Time', value: 'json', icon: mdiTimerOutline },
  status: {
    label: 'Status',
    value: 'status',
    icon: mdiArrowDownDropCircleOutline,
  },
  label: { label: 'Label', value: 'label', icon: mdiLabelOutline },
}

export const supportedStaticPropertyTypes: Record<
  string,
  { label: string; value: string; icon: string }
> = {
  date: {
    label: 'Creation Date',
    value: 'creation_date',
    icon: mdiClockOutline,
  },
  person: {
    label: 'Update Date',
    value: 'update_date',
    icon: mdiContentSaveOutline,
  },
}

type Validators = {
  [P in Condition['type']]: (
    doc: SerializedDocWithSupplemental,
    condition: SerializeDateProps<Kind<Condition, P>>
  ) => boolean
}

const validators: Validators = {
  label: (doc, condition) => {
    if (doc.tags.length === 0) {
      return false
    }
    const targetTagSet = new Set(condition.value)
    for (const tag of doc.tags) {
      if (targetTagSet.has(tag.id)) {
        return true
      }
    }
    return false
  },

  creation_date: (doc, condition) => {
    return validateDateValue(new Date(doc.createdAt), condition.value)
  },

  update_date: (doc, condition) => {
    if (doc.updatedAt == null) {
      return false
    }
    return validateDateValue(new Date(doc.updatedAt), condition.value)
  },

  prop: (doc, condition) => {
    if (doc.props == null) {
      return false
    }
    const prop = doc.props[condition.value.name]
    if (
      prop == null ||
      prop.data == null ||
      prop.data.type !== condition.value.type
    ) {
      return false
    }

    const nonNullableVal = Array.isArray(prop.data)
      ? prop.data.filter((d) => d != null)
      : prop.data

    if (Array.isArray(nonNullableVal) && nonNullableVal.length === 0) {
      return false
    }

    switch (condition.value.type) {
      case 'date':
        return validateDateValue(nonNullableVal, condition.value.value)
      case 'json':
        return false
      case 'user':
        return Array.isArray(condition.value.value)
          ? condition.value.value.reduce((acc, val) => {
              return (
                acc ||
                equalsOrContains(
                  (permission, id) => permission.userId === id,
                  nonNullableVal,
                  val
                )
              )
            }, true as boolean)
          : equalsOrContains(
              (permission, id) => permission.userId === id,
              nonNullableVal,
              condition.value.value
            )
      case 'number':
        return equalsOrContains(
          (n, n2) => n === Number(n2),
          prop.data,
          condition.value.value
        )
      case 'string':
        return equalsOrContains(
          (s1, s2) => s1 === s2,
          prop.data,
          condition.value.value
        )
      default:
        return false
    }
  },

  query: (_doc, _condition) => {
    return false
  },
}

function equalsOrContains<T, U>(
  cmp: (t1: T, t2: U) => boolean,
  test1: T | T[],
  test2: U
): boolean {
  return Array.isArray(test1)
    ? test1.some((item) => cmp(item, test2))
    : cmp(test1, test2)
}

function validateDateValue(
  targetDate: Date,
  dateConditionValue: SerializeDateProps<DateCondition>
) {
  const todayDate = localizeDate(new Date())
  const localizedTargetDate = localizeDate(targetDate)

  switch (dateConditionValue.type) {
    case 'relative':
      return (
        localizedTargetDate >= addSeconds(todayDate, dateConditionValue.period)
      )
    case 'after':
      const afterDate = new Date(dateConditionValue.date)
      return localizedTargetDate >= afterDate
    case 'specific':
      const specificDate = new Date(dateConditionValue.date)
      return (
        localizedTargetDate >= specificDate &&
        localizedTargetDate < addDays(specificDate, 1)
      )
    case 'before':
      const beforeDate = new Date(dateConditionValue.date)
      return localizedTargetDate < beforeDate
    case 'between':
      const fromDate = new Date(dateConditionValue.from)
      const toDate = new Date(dateConditionValue.to)
      return localizedTargetDate >= fromDate && localizedTargetDate <= toDate
    default:
      return false
  }
}

function checkRule(
  test2: boolean,
  rule: 'and' | 'or',
  test1: boolean | undefined
) {
  if (test1 == null) {
    return test2
  }

  return rule === 'or' ? test1 || test2 : test1 && test2
}

export function buildSmartViewQueryCheck(query: SerializedQuery) {
  return (doc: SerializedDocWithSupplemental) => {
    if (!Array.isArray(query)) {
      return false
    }
    return query.reduce((result, condition) => {
      const validator = validators[condition.type]
      return checkRule(validator(doc, condition as any), condition.rule, result)
    }, undefined as boolean | undefined)
  }
}
