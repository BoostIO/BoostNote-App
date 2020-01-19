import shortid from 'shortid'
import { randomBytes } from 'crypto'

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function generateId(): string {
  return shortid.generate()
}

export const generateRandomHex = () => randomBytes(32).toString('hex')

export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
