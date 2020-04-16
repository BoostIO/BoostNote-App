import iconv from 'iconv-lite'

type InitHeaders = Headers | Record<string, string> | string[][]

export const setHeader = <T extends InitHeaders>(
  key: string,
  value: string,
  headers: T
): T => {
  if (Array.isArray(headers)) {
    headers.push([key, value])
  } else if (headers instanceof Headers) {
    headers.set(key, value)
  } else {
    headers[key] = value
  }

  return headers
}

export const decodeResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type')
  const _charset =
    contentType != null ? extractContentTypeCharset(contentType) : ''
  const arrayBuffer = await response.arrayBuffer()
  let charset
  try {
    charset =
      _charset !== '' && iconv.encodingExists(_charset) ? _charset : 'utf-8'
    return iconv.decode(Buffer.from(arrayBuffer), charset).toString()
  } catch (e) {
    console.log(e)
  }
  return ''
}

export const extractContentTypeCharset = (contentType: string): string => {
  const charset = contentType
    .split(';')
    .filter((str) => {
      return str.trim().toLowerCase().startsWith('charset')
    })
    .map((str) => {
      return str.replace(/['"]/g, '').split('=')[1]
    })[0]
  if (charset != undefined) {
    return charset
  } else {
    return ''
  }
}

export const isImageResponse = (response: Response) => {
  const contentType = response.headers.get('content-type')
  let result
  if (contentType != null) {
    result = contentType.match(/^image\/.+$/)
  }
  return result != null
}
