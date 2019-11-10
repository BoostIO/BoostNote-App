import shortid from 'shortid'

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function generateId(): string {
  return shortid.generate()
}
