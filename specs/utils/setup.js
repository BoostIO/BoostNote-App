import LocalStorageMock from 'specs/__mocks__/LocalStorageMock'

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock()
})
