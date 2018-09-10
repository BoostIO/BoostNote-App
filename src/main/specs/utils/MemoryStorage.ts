export default class MemoryStorage implements Storage {
  private map: Map<string, string>

  get length () {
    return this.map.size
  }

  [Symbol.iterator] () {
    return this.map[Symbol.iterator]()
  }

  constructor () {
    this.map = new Map()
  }

  setItem (key: string, value: any) {
    this.map.set(key, value.toString())
  }

  getItem (key: string) {
    if (this.map.has(key)) {
      return this.map.get(key) as string
    }
    return null
  }

  clear () {
    this.map = new Map()
  }

  removeItem (key: string) {
    this.map.delete(key)
  }

  key (index: number) {
    return this.map.keys()[index]
  }
}
