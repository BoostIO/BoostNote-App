import shortid from 'shortid'

export function generateMockId() {
  return shortid()
}

export function getCurrentTime() {
  return new Date().toISOString()
}
