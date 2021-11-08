import { Condition, ConditionType } from '../../../../interfaces/db/smartView'

export type EditableQuery = EditableCondition[]

export type EditableCondition =
  | ConditionType<'query', EditableQuery>
  | Exclude<Condition, { type: 'query' }>
  | { type: 'null'; rule: 'and' | 'or' }

export type Kind<T extends { type: string }, K extends T['type']> = Extract<
  T,
  { type: K }
>
