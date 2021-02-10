import { Err, map, Ok, Result } from '../lib/result'
import {
  AuthAcceptMessage,
  AuthErrors,
  ErrorMessage,
  PublishMessage,
  ServerChannelMessage,
  ServerChannelMessageContent,
  ServerChannelMessageType,
  ServerMessage,
  ServerMessageType,
  SubscribeAcceptMessage,
  ChannelErrors,
  UnsubscribeAcceptMessage,
} from './types'

export function AuthAccept(): Buffer {
  return Buffer.of(ServerMessageType.Auth)
}

export function SubscribeAccept(token: string): Buffer {
  return Buffer.of(
    ServerMessageType.Channel,
    ServerChannelMessageType.Subscribe,
    ...Buffer.from(token)
  )
}

export function UnsubscribeAccept(token: string): Buffer {
  return Buffer.of(
    ServerMessageType.Channel,
    ServerChannelMessageType.Unsubscribe,
    ...Buffer.from(token)
  )
}

export function Publish(token: string, data: Uint8Array): Buffer {
  const buffer = Buffer.alloc(4)
  buffer.writeUInt8(ServerMessageType.Channel, 0)
  buffer.writeUInt8(ServerChannelMessageType.Push, 1)
  const pathBuf = Buffer.from(token)
  buffer.writeUInt16BE(pathBuf.byteLength, 2)
  return Buffer.of(...buffer, ...pathBuf, ...data)
}

export function AuthInvalidError(): Buffer {
  const buffer = Buffer.alloc(3)
  buffer.writeUInt8(ServerMessageType.Error, 0)
  buffer.writeUInt16BE(AuthErrors.Invalid, 1)
  return buffer
}

export function AuthExpiredError(): Buffer {
  const buffer = Buffer.alloc(3)
  buffer.writeUInt8(ServerMessageType.Error, 0)
  buffer.writeUInt16BE(AuthErrors.Expired, 1)
  return buffer
}

export function SubscribeForbiddenError(token: string): Buffer {
  const buffer = Buffer.alloc(3)
  buffer.writeUInt8(ServerMessageType.Error, 0)
  buffer.writeUInt16BE(ChannelErrors.Forbidden, 1)
  return Buffer.of(...buffer, ...Buffer.from(token))
}

export function SubscribeServerError(token: string, message = ''): Buffer {
  const buffer = Buffer.alloc(3)
  buffer.writeUInt8(ServerMessageType.Error, 0)
  buffer.writeUInt16BE(ChannelErrors.ServerError, 1)
  return Buffer.of(...buffer, ...Buffer.from(`${token},${message}`, 'utf8'))
}

export function isAuthAccept(msg: ServerMessage): msg is AuthAcceptMessage {
  return msg.type === ServerMessageType.Auth
}

export function isChannelMessage(
  msg: ServerMessage
): msg is ServerChannelMessage {
  return msg.type === ServerMessageType.Channel
}

export function isSubscribeAccept(
  msg: ServerChannelMessageContent
): msg is SubscribeAcceptMessage {
  return msg.type === ServerChannelMessageType.Subscribe
}

export function isUnsubscribeAccept(
  msg: ServerChannelMessageContent
): msg is UnsubscribeAcceptMessage {
  return msg.type === ServerChannelMessageType.Unsubscribe
}

export function isPublishMessage(
  msg: ServerChannelMessageContent
): msg is PublishMessage {
  return msg.type === ServerChannelMessageType.Push
}

export function isError(msg: ServerMessage): msg is ErrorMessage {
  return msg.type === ServerMessageType.Error
}

export function isSubscribeError(msg: ErrorMessage): boolean {
  return (
    msg.code === ChannelErrors.Forbidden ||
    msg.code === ChannelErrors.ServerError
  )
}

export function parse(message: ArrayBuffer): Result<null, ServerMessage> {
  const view = new DataView(message)
  switch (view.getUint8(0)) {
    case ServerMessageType.Auth: {
      return Ok({ type: ServerMessageType.Auth })
    }
    case ServerMessageType.Channel: {
      return map(
        (message) => ({
          type: ServerMessageType.Channel,
          message,
        }),
        parseChannelMessage(new DataView(message, 1))
      )
    }
    case ServerMessageType.Error: {
      const decode = getDecoder()
      return Ok({
        type: ServerMessageType.Error,
        code: view.getUint16(1),
        body: decode(new Uint8Array(message, 3)),
      })
    }
    default:
      return Err(null)
  }
}

function parseChannelMessage(
  view: DataView
): Result<null, ServerChannelMessageContent> {
  const decode = getDecoder()
  switch (view.getUint8(0)) {
    case ServerChannelMessageType.Subscribe: {
      return Ok({
        type: ServerChannelMessageType.Subscribe,
        token: decode(new Uint8Array(view.buffer, view.byteOffset + 1)),
      })
    }
    case ServerChannelMessageType.Unsubscribe: {
      return Ok({
        type: ServerChannelMessageType.Unsubscribe,
        token: decode(new Uint8Array(view.buffer, view.byteOffset + 1)),
      })
    }
    case ServerChannelMessageType.Push: {
      const pathLen = view.getUint16(1)
      return Ok({
        type: ServerChannelMessageType.Push,
        path: decode(new Uint8Array(view.buffer, view.byteOffset + 3, pathLen)),
        body: new Uint8Array(view.buffer, view.byteOffset + 3 + pathLen),
      })
    }
    default:
      return Err(null)
  }
}

function getDecoder(): (arr: Uint8Array) => string {
  if (typeof Buffer !== 'undefined') {
    return (arr) => Buffer.from(arr).toString('utf8')
  } else if (typeof TextDecoder !== 'undefined') {
    const decoder = new TextDecoder()
    return (arr) => decoder.decode(arr)
  } else {
    throw Error('No decoder available')
  }
}
