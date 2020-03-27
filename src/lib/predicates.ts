import ow, { BasePredicate } from 'ow'

export type PredicateSchema = { [key: string]: BasePredicate<any> }

export type PredicateValue<T extends BasePredicate> = T extends BasePredicate<
  infer U
>
  ? U
  : never

export type ValidatedObject<S extends PredicateSchema> = {
  [K in keyof S]: PredicateValue<S[K]>
}

export const schema = <T extends PredicateSchema>(
  predicateSchema: T
): BasePredicate<ValidatedObject<T>> =>
  ow.object.is((value) => {
    const predicateEntries = Object.entries(predicateSchema)
    for (const [key, predicate] of predicateEntries) {
      try {
        ow(value[key], predicate)
      } catch (error) {
        return false
      }
    }

    return true
  })

export const optional = <T extends PredicateSchema>(
  predicateSchema: T
): BasePredicate<ValidatedObject<T>> =>
  ow.optional.object.is((value) => {
    const predicateEntries = Object.entries(predicateSchema)
    for (const [key, predicate] of predicateEntries) {
      try {
        ow(value[key], predicate)
      } catch (error) {
        return false
      }
    }

    return true
  })

export function isValid<T>(
  value: any,
  predicate: BasePredicate<T>
): value is T {
  return ow.isValid(value, predicate)
}
