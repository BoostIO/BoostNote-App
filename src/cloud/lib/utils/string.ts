import UuidParse from 'uuid-parse'
import originalFilenamify from 'filenamify'
import { Url } from '../../lib/router'
import { format as formatUrl } from 'url'

export function filenamify(value: string) {
  return originalFilenamify(value, { replacement: '-' })
}

export function getHexFromUUID(uuid: string) {
  const uuidBuffer = Buffer.alloc(16)
  UuidParse.parse(uuid, uuidBuffer)
  const uuidHex = uuidBuffer.toString('hex')
  return uuidHex
}

export function getUUIDFromHex(hex: string) {
  const hexBuffer = Buffer.from(hex, 'hex')
  const uuidResultBuffer = UuidParse.unparse(hexBuffer)
  return uuidResultBuffer.toString()
}

export function isEmailValid(email: string) {
  const emailRegex = /^\S+@\S+\..+$/
  return email.match(emailRegex)
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export function getColorFromString(key: string) {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash)
  }
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += ('00' + value.toString(16)).substr(-2)
  }
  return colour
}

export function isValidUUID(val: string) {
  let uuid = val
  if (val.length === 32) {
    uuid = getUUIDFromHex(val)
  }

  if (uuid.length !== 36) {
    return false
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  )
}

export function capitalize(str: string) {
  return str.length < 1 ? '' : `${str[0].toUpperCase()}${str.slice(1)}`
}

export function stringifyUrl(url: Url): string {
  return typeof url === 'string' ? url : formatUrl(url)
}
