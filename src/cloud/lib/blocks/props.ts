const PROP_TYPES = [
  'text',
  'number',
  'date',
  'url',
  'checkbox',
  'user',
] as const

export type PropType = typeof PROP_TYPES[number]
// eslint-disable-next-line prettier/prettier
export type PropKey = `${string}:${PropType}`

export function isPropKey(k: any): k is PropKey {
  if (typeof k !== 'string') {
    return false
  }

  const [_key, type, ...rest] = k.split(':')
  if (rest.length !== 0) {
    return false
  }

  return PROP_TYPES.includes(type as any)
}

export function makePropKey(name: string, type: PropType): PropKey {
  return `${name}:${type}`
}

export function getPropName(type: PropKey): string {
  return type.split(':')[0]
}

export function getPropType(type: PropKey): PropType {
  return type.split(':')[1] as PropType
}
