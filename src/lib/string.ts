import shortid from 'shortid'
import { randomBytes } from 'crypto'
import originalFilenamify from 'filenamify'

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function generateId(): string {
  return shortid.generate()
}

export const generateRandomHex = () => randomBytes(32).toString('hex')

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&')
}

export function filenamify(value: string) {
  return originalFilenamify(value, { replacement: '-' })
}

export function getHexatrigesimalString(value: number) {
  return value.toString(36)
}

export function parseNumberStringOrReturnZero(str: string): number {
  if (!Number.isNaN(parseInt(str))) {
    return parseInt(str)
  } else {
    return 0
  }
}

export function isValidUrl(str: string): boolean {
  return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(
    str
  )
}
