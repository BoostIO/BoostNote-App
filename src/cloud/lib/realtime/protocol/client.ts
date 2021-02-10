import { Err, map, Ok, Result } from '../lib/result'
import {
  Auth,
  ChannelMessageType,
  ClientChannelMessageContent,
  ClientMessage,
  ClientChannelMessage,
  Message,
  MessageType,
  Subscribe,
  Unsubscribe,
} from './types'

const decoder = new TextDecoder('utf8')
const encoder = new TextEncoder()

// Uint8Array better than ArrayBuffer?
// Abstract decoder|encoder to handle browser env + polyfill
export function AuthMessage(auth: string): ArrayBuffer {
  const encoded = encoder.encode(auth)
  const buffer = new ArrayBuffer(1 + encoded.byteLength)
  const view = new Uint8Array(buffer)
  view[0] = MessageType.Auth
  view.set(encoded, 1)
  return buffer
}

export function SubscribeMessage(channel: string): ArrayBuffer {
  const encoded = encoder.encode(channel)
  const buffer = new ArrayBuffer(2 + encoded.length)
  const view = new Uint8Array(buffer)
  view[0] = MessageType.ChannelMessage
  view[2] = ChannelMessageType.Subscribe
  view.set(encoded, 2)
  return buffer
}

export function UnsubscribeMessage(channel: string): ArrayBuffer {
  const encoded = encoder.encode(channel)
  const buffer = new ArrayBuffer(2 + encoded.length)
  const view = new Uint8Array(buffer)
  view[0] = MessageType.ChannelMessage
  view[1] = ChannelMessageType.Unsubscribe
  view.set(encoded, 2)
  return buffer
}

export function ChannelMessage(
  channel: string,
  message: Uint8Array
): ArrayBuffer {
  const pathBuf = encoder.encode(channel)
  const buffer = new ArrayBuffer(4 + pathBuf.length + message.byteLength)
  const view = new DataView(buffer, 0, 4)
  view.setInt8(0, MessageType.ChannelMessage)
  view.setInt8(1, ChannelMessageType.Message)
  view.setUint16(2, pathBuf.byteLength)
  new Uint8Array(buffer, 4, 4 + pathBuf.byteLength).set(pathBuf)
  new Uint8Array(buffer, 4 + pathBuf.byteLength).set(message)
  return buffer
}

export function isAuthMessage(msg: ClientMessage): msg is Auth {
  return msg.type === MessageType.Auth
}

export function isChannelMessage(
  msg: ClientMessage
): msg is ClientChannelMessage {
  return msg.type === MessageType.ChannelMessage
}

export function isSubscribeMessage(
  msg: ClientChannelMessageContent
): msg is Subscribe {
  return msg.type === ChannelMessageType.Subscribe
}

export function isUnsubscribeMessage(
  msg: ClientChannelMessageContent
): msg is Unsubscribe {
  return msg.type === ChannelMessageType.Unsubscribe
}

export function isMessage(msg: ClientChannelMessageContent): msg is Message {
  return msg.type === ChannelMessageType.Message
}

export function parse(message: ArrayBuffer): Result<null, ClientMessage> {
  const view = new DataView(message)
  switch (view.getUint8(0)) {
    case MessageType.Auth: {
      return Ok({
        type: MessageType.Auth,
        auth: decoder.decode(new Uint8Array(message, 1)),
      })
    }
    case MessageType.ChannelMessage: {
      return map(
        (message) => ({
          type: MessageType.ChannelMessage,
          message,
        }),
        parseChannelMessage(new DataView(message, 1))
      )
    }
    default:
      return Err(null)
  }
}

export function parseChannelMessage(
  msg: DataView
): Result<null, ClientChannelMessageContent> {
  switch (msg.getUint8(0)) {
    case ChannelMessageType.Subscribe: {
      return Ok({
        type: ChannelMessageType.Subscribe,
        token: decoder.decode(new Uint8Array(msg.buffer, msg.byteOffset + 1)),
      })
    }
    case ChannelMessageType.Unsubscribe: {
      return Ok({
        type: ChannelMessageType.Unsubscribe,
        token: decoder.decode(new Uint8Array(msg.buffer, msg.byteOffset + 1)),
      })
    }
    case ChannelMessageType.Message: {
      const tokenStart = msg.byteOffset + 3
      const tokenLength = msg.getUint16(1)
      const tokenEnd = tokenStart + msg.getUint16(1)
      const token = decoder.decode(
        new Uint8Array(msg.buffer, tokenStart, tokenLength)
      )
      const message = new Uint8Array(msg.buffer, tokenEnd)
      return Ok({ type: ChannelMessageType.Message, token, message })
    }
    default: {
      return Err(null)
    }
  }
}
