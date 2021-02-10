import { isOk, Result, unwrap } from '../lib/result'
import {
  AuthMessage,
  ChannelMessage,
  SubscribeMessage,
  UnsubscribeMessage,
} from '../protocol/client'
import {
  isAuthAccept,
  isChannelMessage,
  isError,
  isPublishMessage,
  isSubscribeAccept,
  isUnsubscribeAccept,
  parse,
} from '../protocol/server'
import { ChannelErrors, ServerMessage } from '../protocol/types'
import { V1 } from '../protocol/version'
import { Subject, Observable, merge, throwError } from 'rxjs'
import {
  filter,
  finalize,
  map,
  mergeMap,
  share,
  take,
  takeUntil,
  takeWhile,
} from 'rxjs/operators'
import { eq } from '../lib/functional'
import { VirtualConnection } from './VirtualConnection'
import { pipe, prop } from 'ramda'

interface Config {
  auth: string
  url: string
  backoffAlgo?: (attempt: number) => number
  WebSocketConstructor?: typeof WebSocket
  protocolVersion?: 'v1'
}

export function MultiplexConnection({
  auth,
  url,
  WebSocketConstructor = WebSocket,
  backoffAlgo = exponentialBackoff(),
}: Config): [(token: string) => WebSocket, () => void] {
  let authed = false
  let shouldClose = false
  const backoffStep = backoff(backoffAlgo)
  const observableCache = new Map<string, Observable<Uint8Array>>()
  const subscriptions = new Set<string>()
  const bufferedSubscriptions = new Set<string>()

  const authCallback = () => {
    authed = true
    for (const token of bufferedSubscriptions.values()) {
      conn.send(SubscribeMessage(token))
      bufferedSubscriptions.delete(token)
    }
  }

  let rootStream = new Subject<Result<null, ServerMessage>>()
  let conn = setupWebSocket(url, rootStream, WebSocketConstructor)
  conn.onopen = () => {
    conn.send(AuthMessage(auth))
  }
  onAuth(rootStream, authCallback)
  let messageStream = makeMessageStream(rootStream, () => authed)

  const reset = () => {
    rootStream.complete()
    authed = false

    if (shouldClose) return

    rootStream = new Subject<Result<null, ServerMessage>>()
    onAuth(rootStream, authCallback)
    messageStream = makeMessageStream(rootStream, () => authed)
    setTimeout(() => {
      conn = setupWebSocket(url, rootStream, WebSocketConstructor)
      conn.onopen = () => {
        conn.send(AuthMessage(auth))
      }
      conn.onclose = reset
    }, backoffStep())
  }

  conn.onclose = reset

  const subscribe = (token: string) => {
    if (!authed) {
      bufferedSubscriptions.add(token)
    } else {
      conn.send(SubscribeMessage(token))
    }
  }

  return [
    (token: string): WebSocket => {
      if (!observableCache.has(token)) {
        observableCache.set(
          token,
          makeChannelStream(token, messageStream, () => {
            conn.send(UnsubscribeMessage(token))
            bufferedSubscriptions.delete(token)
            subscriptions.delete(token)
            observableCache.delete(token)
          })
        )
      }

      const observable = observableCache.get(token)
      const userConn = makeVirtualConnection(observable!, (msg) => {
        if (conn.readyState === WebSocket.OPEN) {
          conn.send(ChannelMessage(token, msg))
        }
      })
      if (subscriptions.has(token)) {
        Promise.resolve().then(() => {
          userConn.readyState = WebSocket.OPEN
          userConn.dispatchEvent(new Event('open'))
        })
      } else {
        makeSubscribeAcceptStream(token, messageStream).subscribe(
          () => {
            subscriptions.add(token)
            userConn.readyState = WebSocket.OPEN
            userConn.dispatchEvent(new Event('open'))
          },
          () => null
        )
        subscribe(token)
      }
      return userConn
    },
    () => {
      shouldClose = true
      conn.close()
    },
  ]
}

function setupWebSocket(
  url: string,
  stream: Subject<Result<null, ServerMessage>>,
  constructor: typeof WebSocket
) {
  const conn = new constructor(url, V1)
  conn.binaryType = 'arraybuffer'
  conn.onmessage = (ev) => {
    stream.next(parse(ev.data))
  }
  conn.onerror = () => {
    stream.error('connection error')
  }
  return conn
}

function makeMessageStream(
  stream: Observable<Result<null, ServerMessage>>,
  pred: () => boolean
) {
  return stream.pipe(takeWhile(pred), filter(isOk), map(unwrap), share())
}

function onAuth(
  stream: Observable<Result<null, ServerMessage>>,
  cb: () => void
) {
  return stream
    .pipe(filter(isOk), map(unwrap), filter(isAuthAccept), take(1))
    .subscribe(
      () => cb(),
      () => null
    )
}

function makeSubscribeAcceptStream(
  token: string,
  stream: Observable<ServerMessage>
) {
  return stream.pipe(
    filter(isChannelMessage),
    map(prop('message')),
    filter(isSubscribeAccept),
    filter(pipe(prop('token'), eq(token))),
    take(1)
  )
}

function makeChannelStream(
  token: string,
  stream: Observable<ServerMessage>,
  onFinalize: () => void
): Observable<Uint8Array> {
  const unsubcribe = stream.pipe(
    filter(isChannelMessage),
    map(prop('message')),
    filter(isUnsubscribeAccept),
    filter(pipe(prop('token'), eq(token))),
    take(1)
  )

  const err = stream.pipe(
    filter(isError),
    filter((err) => {
      return (
        err.code === ChannelErrors.ServerError ||
        err.code === ChannelErrors.Forbidden
      )
    }),
    filter(pipe(prop('body'), eq(token))),
    take(1),
    mergeMap((err) =>
      throwError(
        new Error(
          err.code === ChannelErrors.ServerError ? err.body : 'Forbidden'
        )
      )
    )
  )

  return merge(
    err,
    stream.pipe(
      filter(isChannelMessage),
      map(prop('message')),
      filter(isPublishMessage),
      filter(pipe(prop('path'), eq(token))),
      map(prop('body')),
      takeUntil(unsubcribe),
      finalize(onFinalize),
      share()
    )
  )
}

function makeVirtualConnection(
  observable: Observable<Uint8Array>,
  send: (data: Uint8Array) => void
) {
  return new VirtualConnection(observable, send)
}

function backoff(algo: (attempt: number) => number) {
  let i = 0
  return () => Math.max(0, algo(i++))
}

function exponentialBackoff({ fac = 1.5, max = Infinity } = {}) {
  return (attempt: number) => {
    return Math.min(Math.log(attempt) * fac, max) * 1000
  }
}
