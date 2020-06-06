import {
  isImageResponse,
} from '../http'

describe('isImageResponse', () => {
  it('returns true for image response', () => {
    const res = 'image/jpeg'
    expect(isImageResponse(res)).toBeTruthy()
  })

  it('returns false for non image response', () => {
    const res = 'text/javascript'
    expect(isImageResponse(res)).toBeFalsy()
  })
})
