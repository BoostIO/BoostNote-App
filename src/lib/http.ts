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

export const isImageResponse = (contentType: string) => {
  let result
  if (contentType != null) {
    result = contentType.match(/^image\/.+$/)
  }
  return result != null
}
