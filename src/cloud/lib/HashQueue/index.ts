export class HashQueue<K, T> implements Iterable<[K, T]>, Iterator<[K, T]> {
  private map: Map<K, T>
  private order: K[]

  public constructor() {
    this.map = new Map()
    this.order = []
  }

  public push(key: K, value: T) {
    this.map.set(key, value)
    this.order.push(key)
  }

  public pop(): [K, T] | undefined {
    const key = this.order.shift()
    if (key == null) return undefined
    const item = this.map.get(key)
    if (item == null) return undefined
    this.map.delete(key)
    return [key, item]
  }

  public delete(key: K) {
    this.map.delete(key)
    this.order = this.order.filter((k) => k !== key)
  }

  public next(): IteratorResult<[K, T]> {
    const item = this.pop()
    if (item == null) {
      return {
        done: true,
        value: undefined,
      }
    }
    return { done: false, value: item }
  }

  public [Symbol.iterator]() {
    return this
  }
}
