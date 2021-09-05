import UuidParse from 'uuid-parse'
import uuid from 'uuid'

export function generateMockId() {
  return uuid.v4()
}

export function getCurrentTime() {
  return new Date().toISOString()
}

export class SetMap<T> {
  map: Map<string, Set<T>>

  constructor() {
    this.map = new Map()
  }

  getSet(key: string) {
    return this.map.get(key) || new Set<T>()
  }

  removeSet(key: string) {
    this.map.delete(key)
  }

  addValue(key: string, value: T) {
    const set = this.getSet(key)
    set.add(value)
    this.map.set(key, set)
  }

  removeValue(key: string, value: T) {
    const set = this.getSet(key)
    set.delete(value)
    this.map.set(key, set)
  }
}

export function getResourceFromSlug(resourceSlug: string) {
  const resourceData = resourceSlug.split('-').reverse()[0]
  return [resourceData.slice(0, 2), getUUIDFromHex(resourceData.slice(2))]
}

export function getUUIDFromHex(hex: string) {
  const hexBuffer = Buffer.from(hex, 'hex')
  const uuidResultBuffer = UuidParse.unparse(hexBuffer)
  return uuidResultBuffer.toString()
}
