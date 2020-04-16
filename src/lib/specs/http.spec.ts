import {
  extractContentTypeCharset,
  isImageResponse,
  decodeResponse,
} from '../http'
import iconv from 'iconv-lite'

const { Response } = jest.requireActual('node-fetch')

describe('decodeResponse', () => {
  it('returns correct decoded response body', async () => {
    const content = 'test①②③'
    const sjisBuffer = iconv.encode(content, 'SJIS')
    const res: Response = new Response(sjisBuffer)
    res.headers.delete('content-type')
    res.headers.append('content-type', 'text/plain; charset=SJIS')
    const result: string = await decodeResponse(res)
    expect(result).toEqual(content)
  })
})

describe('extractContentTypeCharset', () => {
  it('returns correct charset for contentType with charset', () => {
    expect(extractContentTypeCharset('text/html; charset=utf-8; ')).toBe('utf-8')
  })

  it('returns empty string for contentType without charset', () => {
    expect(extractContentTypeCharset('text/javascript')).toBe('')
  })

  it('returns empty string for empty contentType', () => {
    expect(extractContentTypeCharset('')).toBe('')
  })
})

describe('isImageResponse', () => {
  it('returns true for image response', () => {
    const res: Response = new Response()
    res.headers.append('content-type', 'image/jpeg')
    expect(isImageResponse(res)).toBeTruthy()
  })

  it('returns false for non image response', () => {
    const res: Response = new Response()
    res.headers.append('content-type', 'text/javascript')
    expect(isImageResponse(res)).toBeFalsy()
  })
})