export function makeConstructor(
  multiplex: (token: string) => WebSocket
): typeof WebSocket {
  return function (url = '') {
    const token = url.split('/')[1]
    return multiplex(token)
  } as any
}
