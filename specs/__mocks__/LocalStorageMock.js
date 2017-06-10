class LocalStorageMock {
  constructor () {
    this.data = {}

    Object.defineProperty(this, 'length', {
      get: () => Object.keys(this.data).length
    })
  }

  key (index) {
    return Object.keys(this.data)[index]
  }

  setItem (key, value) {
    this.data[String(key)] = String(value)
  }

  getItem (key) {
    return this.data[String(key)]
  }

  removeItem (key) {
    delete this.data[String(key)]
  }

  clear () {
    this.data = {}
  }
}

export default LocalStorageMock
