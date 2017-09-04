import { randomBytes } from 'crypto'

export function generateRandomId (size = 6) {
  return randomBytes(size).toString('base64')
}
