import shortid from 'shortid'

export function generateMockId() {
  return shortid()
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
