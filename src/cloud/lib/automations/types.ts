export type StdPrimitiveMap = {
  string: string
  number: number
  boolean: boolean
}
export type StdPrimitives = keyof StdPrimitiveMap

export type TypeDef<P extends string, U extends string = never> =
  | { type: 'struct'; def: Record<string, TypeDef<P, U>> }
  | { type: 'record'; def: TypeDef<P, U> }
  | { type: 'array'; def: TypeDef<P, U> }
  | { type: 'primitive'; def: P | StdPrimitives }
  | { type: 'optional'; def: TypeDef<P, U> }
  | (U extends string ? { type: 'reference'; def: U } : never)

export function Struct<U extends Record<string, TypeDef<any, any>>>(def: U) {
  return { type: 'struct' as const, def: def as U }
}

export function Record<T extends TypeDef<any, any>>(def: T) {
  return { type: 'record' as const, def: def as T }
}

export function Arr<T extends TypeDef<any, any>>(def: T) {
  return { type: 'array' as const, def: def as T }
}

export function Primitive<P extends string>(def: P) {
  return { type: 'primitive', def } as { type: 'primitive'; def: P }
}

export function Str() {
  return { type: 'primitive' as const, def: 'string' as const }
}

export function Num() {
  return { type: 'primitive' as const, def: 'number' as const }
}

export function Bool() {
  return { type: 'primitive' as const, def: 'boolean' as const }
}

export function Optional<T extends TypeDef<any, any>>(def: T) {
  return { type: 'optional' as const, def }
}

export function Reference<U extends string>(def: U) {
  return { type: 'reference' as const, def: def as U }
}
