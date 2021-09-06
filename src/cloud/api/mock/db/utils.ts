import UuidParse from 'uuid-parse'
import uuid from 'uuid'

export function generateMockId() {
  return uuid.v4()
}

export function getCurrentTime() {
  return new Date().toISOString()
}

export class MockDbMap<T> {
  localStorageKey: string
  map: Map<string, T>

  constructor(localStorageKey: string) {
    this.map = new Map()
    this.localStorageKey = localStorageKey
    this.load()
  }

  get(key: string) {
    return this.map.get(key)
  }

  set(key: string, value: T) {
    this.map.set(key, value)
    this.save()
  }

  delete(key: string) {
    this.map.delete(key)
    this.save()
  }

  [Symbol.iterator]() {
    return this.map.entries()
  }

  save() {
    const data = [...this.map.entries()]

    localStorage.setItem(this.localStorageKey, JSON.stringify(data))
  }

  load() {
    const rawData = localStorage.getItem(this.localStorageKey)
    const newMap = new Map()
    this.map = newMap
    if (rawData == null) {
      return this
    }
    const data: [string, T][] = JSON.parse(rawData)

    data.forEach(([key, value]) => {
      newMap.set(key, value)
    })
    return this
  }

  values() {
    return this.map.values()
  }

  entries() {
    return this.map.entries()
  }

  keys() {
    return this.map.keys()
  }

  reset() {
    localStorage.removeItem(this.localStorageKey)
    this.map = new Map()
  }
}

export class MockDbSetMap<T> {
  localStorageKey: string
  map: Map<string, Set<T>>

  constructor(localStorageKey: string) {
    this.map = new Map()
    this.localStorageKey = localStorageKey
    this.load()
  }

  getSet(key: string) {
    return this.map.get(key) || new Set<T>()
  }

  removeSet(key: string) {
    this.map.delete(key)
    this.save()
  }

  addValue(key: string, value: T) {
    const set = this.getSet(key)
    set.add(value)
    this.map.set(key, set)
    this.save()
  }

  removeValue(key: string, value: T) {
    const set = this.getSet(key)
    set.delete(value)
    this.map.set(key, set)
    this.save()
  }

  save() {
    const data = [...this.map.entries()].map(([key, set]) => {
      return [key, [...set]]
    })

    localStorage.setItem(this.localStorageKey, JSON.stringify(data))
  }

  load() {
    const rawData = localStorage.getItem(this.localStorageKey)
    const newMap = new Map()
    this.map = newMap
    if (rawData == null) {
      return this
    }
    const data: [string, T[]][] = JSON.parse(rawData)

    data.forEach(([key, list]) => {
      newMap.set(key, new Set(list))
    })
    return this
  }

  reset() {
    localStorage.removeItem(this.localStorageKey)
    this.map = new Map()
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
